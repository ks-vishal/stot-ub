const mqtt = require('mqtt');
const config = require('./config');

const client = mqtt.connect(config.MQTT_BROKER_URL);

client.on('connect', () => {
  console.log('[MQTT] Connected to broker:', config.MQTT_BROKER_URL);
});

client.on('error', (err) => {
  console.error('[MQTT] Error:', err);
});

function publishSensorData(transportId, data) {
  const topic = `${config.SENSOR_TOPIC}/${transportId}`;
  client.publish(topic, JSON.stringify(data), { retain: false });
  console.log(`[SIM] Published message_id: ${data.message_id}`);
}

function publishAlert(transportId, alert) {
  const topic = `${config.ALERT_TOPIC}/${transportId}`;
  client.publish(topic, JSON.stringify(alert));
}

function subscribeToAlerts(transportId, callback) {
  const topic = `${config.ALERT_TOPIC}/${transportId}`;
  client.subscribe(topic);
  client.on('message', (t, message) => {
    if (t === topic) {
      callback(JSON.parse(message.toString()));
    }
  });
}

module.exports = {
  client,
  publishSensorData,
  publishAlert,
  subscribeToAlerts
};
