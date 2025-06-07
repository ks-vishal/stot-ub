require('dotenv').config();
const mqtt = require('mqtt');
const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');

// MQTT Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MQTT_TOPIC = 'stotub/uav';

// Flight Configuration
const SOURCE = {
    latitude: 40.7128,
    longitude: -74.0060
};

const DESTINATION = {
    latitude: 40.7589,
    longitude: -73.9851
};

const FLIGHT_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const UPDATE_INTERVAL = 30 * 1000; // 30 seconds in milliseconds
const TOTAL_UPDATES = Math.floor(FLIGHT_DURATION / UPDATE_INTERVAL);

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER);

// Connect to local Ethereum node
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = new ethers.Wallet(process.env.PRIVATE_KEY || '0x' + '1'.repeat(64), provider);

// Flight state
let currentUpdate = 0;
const flightId = uuidv4();
let flightInterval;

function calculateCurrentPosition(progress) {
    // Linear interpolation between source and destination
    const lat = SOURCE.latitude + (DESTINATION.latitude - SOURCE.latitude) * progress;
    const lon = SOURCE.longitude + (DESTINATION.longitude - SOURCE.longitude) * progress;
    return { latitude: lat, longitude: lon };
}

function getFlightStatus(progress) {
    if (progress === 0) return 'Preparing';
    if (progress === 1) return 'Landed';
    return 'In Flight';
}

async function publishFlightUpdate() {
    try {
        const progress = currentUpdate / TOTAL_UPDATES;
        const position = calculateCurrentPosition(progress);
        const status = getFlightStatus(progress);

        const flightData = {
            flightId,
            status,
            ...position,
            timestamp: new Date().toISOString(),
            progress: Math.round(progress * 100)
        };

        // Publish to MQTT
        client.publish(MQTT_TOPIC, JSON.stringify(flightData), { qos: 1 }, (err) => {
            if (err) {
                console.error('Error publishing to MQTT:', err);
            } else {
                console.log('Flight update published to MQTT:', flightData);
            }
        });

        // Record on blockchain
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(flightData)));
        const tx = {
            to: ethers.ZeroAddress,
            data: dataHash,
            value: 0
        };

        const txResponse = await signer.sendTransaction(tx);
        await txResponse.wait();
        
        console.log('Flight update recorded on blockchain:', dataHash);
        console.log('Transaction hash:', txResponse.hash);

        // Update counter and check if flight is complete
        currentUpdate++;
        if (currentUpdate > TOTAL_UPDATES) {
            console.log('Flight completed');
            clearInterval(flightInterval);
            setTimeout(() => {
                client.end();
                process.exit(0);
            }, 1000);
        }
    } catch (error) {
        console.error('Error in publishFlightUpdate:', error);
    }
}

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    console.log(`Starting flight simulation - Flight ID: ${flightId}`);
    console.log(`Source: ${JSON.stringify(SOURCE)}`);
    console.log(`Destination: ${JSON.stringify(DESTINATION)}`);
    console.log(`Duration: ${FLIGHT_DURATION/1000/60} minutes`);
    
    // Start the flight simulation
    publishFlightUpdate(); // Initial update
    flightInterval = setInterval(publishFlightUpdate, UPDATE_INTERVAL);
});

client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Stopping flight simulation...');
    if (flightInterval) clearInterval(flightInterval);
    client.end();
    process.exit();
}); 