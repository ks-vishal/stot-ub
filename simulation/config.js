module.exports = {
  SENSOR_INTERVAL_MS: 30000, // 30 seconds
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  SENSOR_TOPIC: 'stotub/sensors',
  ALERT_TOPIC: 'stotub/alerts',
  FLIGHT_PATH: {
    start: { lat: 28.6139, lng: 77.2090 }, // Example: Hospital A (Delhi)
    end: { lat: 28.7041, lng: 77.1025 }   // Example: Hospital B (Delhi)
  },
  TEMPERATURE_RANGE: { min: 2, max: 8 },
  HUMIDITY_RANGE: { min: 45, max: 65 },
  ACCELERATION_RANGE: { min: 0, max: 5 },
  BATTERY_RANGE: { min: 20, max: 100 },
  FLIGHT_SPEED_KMPH: 60, // Simulated UAV speed
  EMERGENCY_PROBABILITY: 0.05 // 5% chance per interval
};
