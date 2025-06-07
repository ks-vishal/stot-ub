require('dotenv').config();
const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// MQTT Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MQTT_TOPIC = 'stotub/uav';

// Log file configuration
const LOG_DIR = 'logs';
const LOG_FILE = path.join(LOG_DIR, 'uav_flights.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Active flights tracking
const activeFlights = new Map();

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Subscribe to the UAV topic
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
        const { flightId, status, latitude, longitude, timestamp, progress } = data;

        // Update active flights tracking
        if (!activeFlights.has(flightId)) {
            console.log(`New flight detected - ID: ${flightId}`);
            activeFlights.set(flightId, {
                startTime: timestamp,
                updates: 0
            });
        }

        const flight = activeFlights.get(flightId);
        flight.updates++;
        flight.lastUpdate = timestamp;
        flight.lastStatus = status;

        // Create log entry
        const logEntry = {
            timestamp,
            flightId,
            status,
            position: { latitude, longitude },
            progress: `${progress}%`,
            updateCount: flight.updates
        };

        // Log to console with color coding based on status
        const statusColor = status === 'In Flight' ? '\x1b[32m' : // Green
                          status === 'Landed' ? '\x1b[34m' : // Blue
                          '\x1b[33m'; // Yellow for Preparing
        console.log(`${statusColor}Flight Update: ${JSON.stringify(logEntry)}\x1b[0m`);

        // Log to file
        fs.appendFile(
            LOG_FILE,
            `${new Date().toISOString()} - ${JSON.stringify(logEntry)}\n`,
            (err) => {
                if (err) {
                    console.error('Error writing to log file:', err);
                }
            }
        );

        // Clean up completed flights
        if (status === 'Landed') {
            const flightDuration = new Date(timestamp) - new Date(flight.startTime);
            console.log(`\x1b[35mFlight ${flightId} completed:`);
            console.log(`Duration: ${flightDuration / 1000} seconds`);
            console.log(`Total updates: ${flight.updates}\x1b[0m`);
            activeFlights.delete(flightId);
        }

    } catch (error) {
        console.error('Error processing message:', error);
    }
});

client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Stopping UAV monitor...');
    client.end();
    process.exit();
}); 