const mqtt = require('mqtt');

class SensorSimulator {
  constructor() {
    this.client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
    });

    this.client.on('error', (error) => {
      console.error('MQTT connection error:', error);
    });

    this.activeSimulations = new Map();
  }

  startSimulation(transportId) {
    if (this.activeSimulations.has(transportId)) {
      return;
    }

    const interval = setInterval(() => {
      const sensorData = this.generateSensorData();
      this.publishSensorData(transportId, sensorData);
    }, 5000); // Send data every 5 seconds

    this.activeSimulations.set(transportId, interval);
  }

  stopSimulation(transportId) {
    const interval = this.activeSimulations.get(transportId);
    if (interval) {
      clearInterval(interval);
      this.activeSimulations.delete(transportId);
    }
  }

  generateSensorData() {
    return {
      temperature: this.randomInRange(2, 8), // Celsius (ideal organ preservation temperature)
      humidity: this.randomInRange(85, 95), // Percentage
      pressure: this.randomInRange(100, 102), // kPa
      timestamp: new Date().toISOString()
    };
  }

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  publishSensorData(transportId, data) {
    const topic = `organ/transport/${transportId}/sensors`;
    this.client.publish(topic, JSON.stringify(data), { qos: 1 }, (error) => {
      if (error) {
        console.error('Error publishing sensor data:', error);
      }
    });
  }

  // Subscribe to receive commands (e.g., start/stop monitoring)
  subscribeToCommands() {
    this.client.subscribe('organ/transport/+/command', (error) => {
      if (error) {
        console.error('Error subscribing to commands:', error);
        return;
      }

      this.client.on('message', (topic, message) => {
        const transportId = topic.split('/')[2];
        const command = JSON.parse(message.toString());

        switch (command.action) {
          case 'start':
            this.startSimulation(transportId);
            break;
          case 'stop':
            this.stopSimulation(transportId);
            break;
          default:
            console.warn('Unknown command:', command);
        }
      });
    });
  }

  // Check if values are within safe ranges
  checkAlerts(data) {
    const alerts = [];

    if (data.temperature < 2 || data.temperature > 8) {
      alerts.push({
        type: 'temperature',
        message: 'Temperature out of safe range',
        value: data.temperature
      });
    }

    if (data.humidity < 85 || data.humidity > 95) {
      alerts.push({
        type: 'humidity',
        message: 'Humidity out of safe range',
        value: data.humidity
      });
    }

    return alerts;
  }
}

module.exports = new SensorSimulator(); 