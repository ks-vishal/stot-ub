require('dotenv').config();
const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// MQTT Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MQTT_TOPIC = 'stotub/sensors';

// Log file configuration
const LOG_DIR = 'logs';
const LOG_FILE = path.join(LOG_DIR, 'sensor_data.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Subscribe to the sensor data topic
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('Error subscribing to topic:', err);
        } else {
            console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
        }
    });
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
        
        // Log to console
        console.log('Received sensor data:', data);
        
        // Log to file
        fs.appendFile(LOG_FILE, logEntry, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Stopping subscriber...');
    client.end();
    process.exit();
}); 