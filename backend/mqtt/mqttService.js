const mqtt = require('mqtt');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'iot/logs/error.log', level: 'error' }),
        new winston.transports.Console()
    ]
});

class MQTTService {
    constructor(io) {
        this.io = io;
        this.sensorData = new Map();
        this.uavData = new Map();
        this.client = null;
    }

    connect() {
        const brokerUrl = `mqtt://${process.env.MQTT_BROKER}`;
        this.client = mqtt.connect(brokerUrl, {
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD
        });

        this.client.on('connect', () => {
            logger.info('Connected to MQTT broker');
            this.subscribe();
        });

        this.client.on('error', (error) => {
            logger.error('MQTT connection error:', error);
        });
    }

    subscribe() {
        // Subscribe to sensor and UAV topics
        this.client.subscribe('stotub/sensors/#', (err) => {
            if (err) logger.error('Error subscribing to sensors topic:', err);
        });

        this.client.subscribe('stotub/uav/#', (err) => {
            if (err) logger.error('Error subscribing to UAV topic:', err);
        });

        this.client.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                
                if (topic.startsWith('stotub/sensors/')) {
                    const organId = topic.split('/')[2];
                    this.handleSensorData(organId, data);
                } else if (topic.startsWith('stotub/uav/')) {
                    const flightId = topic.split('/')[2];
                    this.handleUAVData(flightId, data);
                }
            } catch (error) {
                logger.error('Error processing MQTT message:', error);
            }
        });
    }

    handleSensorData(organId, data) {
        const sensorData = {
            ...data,
            timestamp: new Date().toISOString()
        };
        this.sensorData.set(organId, sensorData);
        this.io.emit('sensorUpdate', { organId, data: sensorData });

        // Check for alerts
        if (this.checkAlertConditions(sensorData)) {
            this.io.emit('alert', {
                organId,
                type: 'sensor',
                message: 'Abnormal sensor readings detected',
                data: sensorData
            });
        }
    }

    handleUAVData(flightId, data) {
        const uavData = {
            ...data,
            timestamp: new Date().toISOString()
        };
        this.uavData.set(flightId, uavData);
        this.io.emit('uavUpdate', { flightId, data: uavData });
    }

    checkAlertConditions(data) {
        // Check for abnormal conditions
        return (
            data.temperature < 2 || data.temperature > 8 || // Temperature out of range
            data.humidity < 40 || data.humidity > 80 || // Humidity out of range
            data.shock > 2 // Excessive shock detected
        );
    }

    getSensorData(organId) {
        return this.sensorData.get(organId) || null;
    }

    getUAVData(flightId) {
        return this.uavData.get(flightId) || null;
    }
}

module.exports = MQTTService; 