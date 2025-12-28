const config = require('./config');
const { sensorDataGenerator } = require('./sensorSimulator');
const { publishSensorData, publishAlert } = require('./mqttClient');
const { triggerEmergency } = require('./emergencySimulator');
const { loginAndGetToken, sendHashToBackend, hashSensorData, getJwtToken } = require('./blockchain');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api/transports';
const durationMs = 10 * 60 * 1000; // 10 minutes simulated flight
const intervalMs = config.SENSOR_INTERVAL_MS;
const POLL_INTERVAL_MS = 30000; // 30 seconds

const simulatedTransports = new Set();

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(config => {
  const token = getJwtToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

async function safeAxiosRequest(requestFn) {
  try {
    return await requestFn();
  } catch (err) {
    if (err.response && err.response.status === 401) {
      await loginAndGetToken();
      return await requestFn();
    }
    throw err;
  }
}

// Helper to get distance between two lat/lng points
function haversineDistance(lat1, lng1, lat2, lng2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371e3; // meters
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

(async () => {
  await loginAndGetToken();

  async function startTransportSimulation(transport) {
    const transportId = transport.transport_id;
    if (simulatedTransports.has(transportId)) return;
    simulatedTransports.add(transportId);
    let stopped = false;
    function cleanup() {
      if (!stopped) {
        stopped = true;
        simulatedTransports.delete(transportId);
      }
    }
    console.log(`[SIM] Starting simulation for transport: ${transportId}`);
    // Use actual duration and locations
    const durationMs = (transport.estimated_duration || 10) * 60 * 1000;
    const intervalMs = config.SENSOR_INTERVAL_MS;
    const donor = { lat: parseFloat(transport.start_location_lat), lng: parseFloat(transport.start_location_lng) };
    const recipient = { lat: parseFloat(transport.end_location_lat), lng: parseFloat(transport.end_location_lng) };
    const gen = require('./sensorSimulator').sensorDataGenerator(transportId, durationMs, intervalMs, donor, recipient);
    let tick = 0;
    const stopSimulation = async (finalData) => {
      cleanup();
      console.log(`[SIM] Stopping simulation for transport: ${transportId}`);
      // Mark transport as completed in backend
      try {
        await safeAxiosRequest(() => axiosInstance.post(`${BACKEND_URL}/${transportId}/complete`, {
          endLocationLat: finalData.latitude,
          endLocationLng: finalData.longitude,
          finalStatus: 'delivered',
          distanceCovered: null, // Optionally calculate
          averageSpeed: null // Optionally calculate
        }));
        console.log(`[SIM] Marked transport ${transportId} as completed.`);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.warn(`[SIM] Transport ${transportId} completion endpoint returned 404 (already completed or not found).`);
        } else {
          console.error(`[SIM] Failed to mark transport ${transportId} as completed:`, err.message);
        }
      }
    };
    const simInterval = setInterval(async () => {
      if (stopped) {
        clearInterval(simInterval);
        return;
      }
      let data = gen.next().value;
      data.message_id = uuidv4();
      // Randomly trigger emergency
      if (Math.random() < config.EMERGENCY_PROBABILITY) {
        const types = ['temperature', 'humidity', 'shock', 'battery'];
        const type = types[Math.floor(Math.random() * types.length)];
        data = triggerEmergency(type, data);
        publishAlert(transportId, { type, data, timestamp: Date.now() });
        console.log(`[ALERT] Emergency triggered: ${type} for ${transportId}`);
      }
      // Hash and send to blockchain
      const hash = hashSensorData(data);
      await sendHashToBackend(transportId, hash, data);
      tick++;
      // Only one log and publish per tick
      console.log(`[SIM] Tick ${tick} Publishing sensor data for ${transportId} at ${data.timestamp} (message_id: ${data.message_id})`);
      publishSensorData(transportId, data);
      console.log(`[SIM] Tick ${tick} [${transportId}]:`, data);
      // Stop if reached recipient location or duration
      const round2 = v => Math.round(parseFloat(v) * 100) / 100;
      const reachedDestination = (round2(data.latitude) === round2(recipient.lat) && round2(data.longitude) === round2(recipient.lng));
      if (reachedDestination || tick * intervalMs >= durationMs) {
        clearInterval(simInterval);
        await stopSimulation(data);
        return;
      }
      // Check backend status: stop if not in_transit
      try {
        const res = await safeAxiosRequest(() => axiosInstance.get(`${BACKEND_URL}/${transportId}`));
        const status = res.data.status || (res.data.transport && res.data.transport.status);
        if (status && status !== 'in_transit') {
          clearInterval(simInterval);
          console.log(`[SIM] Backend reports transport ${transportId} is now '${status}', stopping simulation.`);
          cleanup();
        }
      } catch (err) {
        console.error(`[SIM] Error checking backend status for ${transportId}:`, err.message);
      }
    }, intervalMs);
  }

  async function pollTransports() {
    try {
      const res = await axiosInstance.get(BACKEND_URL);
      const transports = res.data.transports.filter(t => t.status === 'in_transit');
      transports.forEach((t) => {
        if (!simulatedTransports.has(t.transport_id)) {
          startTransportSimulation(t);
        }
      });
    } catch (err) {
      console.error('[SIM] Error fetching transports:', err.message);
    }
  }
  pollTransports();
  setInterval(pollTransports, POLL_INTERVAL_MS);
})();



// Initial poll and simulation start
// Periodic polling for new in_transit transports

