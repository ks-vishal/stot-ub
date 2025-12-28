const mqtt = require('mqtt');
const { SensorReading, Transport, UAV, Organ } = require('./models');
const logger = require('./utils/logger');
const EventEmitter = require('events');

// Connect to local MQTT broker
const client = mqtt.connect('mqtt://localhost:1883');

let io = null;
const emitter = new EventEmitter();
let subscribed = false;

function setSocketIO(ioInstance) {
  io = ioInstance;
}

client.on('connect', () => {
  logger.info('Connected to MQTT broker');
  if (!subscribed) {
    client.subscribe('stotub/sensors/+');
    logger.info('Subscribed to stotub/sensors/+ topic');
    subscribed = true;
  } else {
    logger.warn('MQTT subscription already set, skipping duplicate subscribe.');
  }
});

logger.info(`[MQTT] Attaching message handler. PID: ${process.pid}`);
client.on('message', async (topic, message) => {
  logger.info(`[MQTT] Message handler triggered. PID: ${process.pid}`);
  try {
    // Topic: stotub/sensors/TRANSPORT_ID
    const match = topic.match(/^stotub\/sensors\/(.+)$/);
    if (!match) return;
    let transport_id = match[1];
    const data = JSON.parse(message.toString());
    logger.info(`[MQTT] Full incoming data: ${JSON.stringify(data)}`);
    logger.info(`[MQTT] Received message_id: ${data.message_id}`);
    // Try to find transport by string ID first, then by numeric ID
    let transport = await Transport.findOne({ where: { transport_id } });
    if (!transport && !isNaN(Number(transport_id))) {
      // Try numeric ID fallback for legacy transports
      transport = await Transport.findOne({ where: { id: Number(transport_id) } });
      if (transport) transport_id = transport.transport_id;
    }
    if (!transport) {
      logger.error(`Transport not found for sensor data: ${transport_id}`);
      return;
    }
    // Map fields for DB and frontend
    const sensorRecord = {
      transport_id,
      organ_id: transport.organ_id,
      uav_id: transport.uav_id,
      timestamp: new Date(data.timestamp || Date.now()),
      temperature: data.temperature,
      humidity: data.humidity,
      pressure: data.pressure,
      altitude: data.altitude,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      battery_level: data.batteryLevel,
      signal_strength: data.signal,
      vibration_level: data.vibration,
      light_intensity: data.light
    };
    // Debug log before saving sensor data
    logger.info(`[MQTT] Saving sensor data for ${transport_id} at ${sensorRecord.timestamp}`);
    try {
      await SensorReading.create(sensorRecord);
      // Sync UAV location
      await UAV.update(
        { current_location_lat: data.latitude, current_location_lng: data.longitude },
        { where: { uav_id: transport.uav_id } }
      );
      // Sync Organ location only if in transit
      await Organ.update(
        { current_location_lat: data.latitude, current_location_lng: data.longitude },
        { where: { organ_id: transport.organ_id, status: 'in_transit' } }
      );
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        logger.warn(`Duplicate sensor data ignored for ${transport_id} at ${sensorRecord.timestamp}`);
      } else {
        throw err;
      }
    }
    // logger.info(`Sensor data stored for transport ${transport_id}`); // Removed to avoid logging on duplicate attempts
    // Emit to WebSocket room if io is set
    if (io) {
      io.to(`transport-${transport_id}`).emit('sensorData', sensorRecord);
    }
    // Emit sensorData event for backend listeners
    emitter.emit('sensorData', transport_id, sensorRecord);
  } catch (err) {
    logger.error('Error processing MQTT message:', err);
  }
});

module.exports = { client, setSocketIO, emitter }; 