require('dotenv').config();
const mqtt = require('mqtt');
const { ethers } = require('ethers');

// MQTT Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MQTT_TOPIC = 'stotub/sensors';

// Sensor simulation configuration
const SIMULATION_INTERVAL = 10000; // 10 seconds

// Fixed sensor values as per requirements
const SENSOR_VALUES = {
    temperature: 4, // 4°C - optimal temperature for organ preservation
    humidity: 60, // 60% humidity
    location: {
        latitude: 40.7128,
        longitude: -74.0060
    },
    acceleration: {
        x: 0,
        y: 0,
        z: 0
    }
};

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER);

// Connect to local Ethereum node
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = new ethers.Wallet(process.env.PRIVATE_KEY || '0x' + '1'.repeat(64), provider);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    startSimulation();
});

client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

async function publishSensorData() {
    try {
        // Add timestamp to sensor data
        const sensorData = {
            ...SENSOR_VALUES,
            timestamp: new Date().toISOString()
        };

        // Publish to MQTT
        client.publish(MQTT_TOPIC, JSON.stringify(sensorData), { qos: 1 }, (err) => {
            if (err) {
                console.error('Error publishing to MQTT:', err);
            } else {
                console.log('Sensor data published to MQTT');
            }
        });

        // Create hash of sensor data and record on blockchain
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(sensorData)));
        
        // Create a simple transaction to store the hash
        const tx = {
            to: ethers.ZeroAddress, // Contract address could go here
            data: dataHash,
            value: 0
        };

        const txResponse = await signer.sendTransaction(tx);
        await txResponse.wait();
        
        console.log('Sensor data hash recorded on blockchain:', dataHash);
        console.log('Transaction hash:', txResponse.hash);

    } catch (error) {
        console.error('Error in publishSensorData:', error);
    }
}

function startSimulation() {
    console.log('Starting sensor simulation...');
    console.log('Initial sensor values:', SENSOR_VALUES);
    
    // Publish data immediately and then every SIMULATION_INTERVAL
    publishSensorData();
    setInterval(publishSensorData, SIMULATION_INTERVAL);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('Stopping sensor simulation...');
    client.end();
    process.exit();
}); 