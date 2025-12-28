const EventEmitter = require('events');
const emitter = new EventEmitter();
const { Transport, Organ } = require('../models');

// In-memory store for latest sensor data per transport
const sensorDataStore = {};

// Store simulation intervals per transport
const simulationIntervals = {};

function randomInRange(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Helper to get donor/recipient locations from transportId
async function getRouteEndpoints(transportId) {
  const transport = await Transport.findOne({ where: { transport_id: transportId } });
  if (!transport) return null;
  // Try to get from transport first, fallback to organ
  let startLat = parseFloat(transport.start_location_lat);
  let startLng = parseFloat(transport.start_location_lng);
  let endLat = parseFloat(transport.end_location_lat);
  let endLng = parseFloat(transport.end_location_lng);
  if ((isNaN(endLat) || isNaN(endLng)) && transport.organ_id) {
    const organ = await Organ.findOne({ where: { organ_id: transport.organ_id } });
    if (organ) {
      endLat = parseFloat(organ.recipient_location_lat);
      endLng = parseFloat(organ.recipient_location_lng);
    }
  }
  return { startLat, startLng, endLat, endLng };
}

// Helper to interpolate between two points
function interpolatePoint(start, end, t) {
  return start + (end - start) * t;
}

// Helper to check if two points are close
function isClose(lat1, lng1, lat2, lng2, epsilon = 0.0001) {
  return Math.abs(lat1 - lat2) < epsilon && Math.abs(lng1 - lng2) < epsilon;
}

async function generateMockSensorData(transportId) {
  // Get endpoints
  if (!sensorDataStore[transportId] || !sensorDataStore[transportId]._route) {
    const route = await getRouteEndpoints(transportId);
    if (!route) return null;
    sensorDataStore[transportId] = { _route: route, _progress: 0 };
  }
  const { startLat, startLng, endLat, endLng } = sensorDataStore[transportId]._route;
  let progress = sensorDataStore[transportId]._progress || 0;
  // Move progress forward (simulate speed)
  progress = Math.min(progress + Math.random() * 0.05 + 0.01, 1); // 1 = arrived
  // Interpolate position
  const latitude = interpolatePoint(startLat, endLat, progress);
  const longitude = interpolatePoint(startLng, endLng, progress);
  // Generate other sensor data as before
  const data = {
    transportId,
    timestamp: Date.now(),
    temperature: randomInRange(2, 8),
    humidity: randomInRange(45, 65),
    pressure: randomInRange(950, 1050, 2),
    latitude,
    longitude,
    altitude: randomInRange(100, 200),
    speed: randomInRange(10, 20),
    batteryLevel: randomInRange(20, 100),
    vibration: randomInRange(0, 5),
    accelerometer: randomInRange(0, 5),
    light: randomInRange(100, 1000),
    signal: randomInRange(-90, -40, 0)
  };
  sensorDataStore[transportId] = {
    ...sensorDataStore[transportId],
    ...data,
    _progress: progress,
    _route: { startLat, startLng, endLat, endLng }
  };
  emitter.emit('sensorData', transportId, data);
  // Stop simulation if arrived
  if (isClose(latitude, longitude, endLat, endLng)) {
    if (simulationIntervals[transportId]) {
      clearInterval(simulationIntervals[transportId]);
      delete simulationIntervals[transportId];
    }
  }
  return data;
}

function startSimulation(transportId) {
  if (simulationIntervals[transportId]) return;
  generateMockSensorData(transportId); // Prime first point
  simulationIntervals[transportId] = setInterval(() => generateMockSensorData(transportId), 5000);
}

async function getLatestSensorData(transportId) {
  if (!sensorDataStore[transportId]) {
    generateMockSensorData(transportId);
  }
  return sensorDataStore[transportId];
}

module.exports = {
  startSimulation,
  getLatestSensorData,
  emitter
}; 