const db = require('../models');
const mqtt = require('../utils/mqtt');
const { getThresholds, checkThresholds } = require('../utils/thresholds');

exports.getRealtimeData = async (req, res) => {
  try {
    const { transportId } = req.params;
    // Simulate or fetch real-time sensor data
    const data = await mqtt.getLatestSensorData(transportId);
    res.json({ data });
  } catch (err) {
    console.error('Get realtime data error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { transportId } = req.params;
    // Fetch sensor readings
    const readings = await db.SensorReading.findAll({ where: { transport_id: transportId }, order: [['timestamp', 'DESC']], limit: 100 });
    // Check for threshold violations
    const thresholds = await getThresholds(transportId);
    const alerts = readings.filter(r => checkThresholds(r, thresholds));
    res.json({ alerts });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSensorHistory = async (req, res) => {
  try {
    const { transportId } = req.params;
    const readings = await db.SensorReading.findAll({
      where: { transport_id: transportId },
      order: [['timestamp', 'ASC']]
    });
    res.json({ readings });
  } catch (err) {
    console.error('Get sensor history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 