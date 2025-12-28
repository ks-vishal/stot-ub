// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title SensorData
 * @dev Environmental sensor data logging with validation and hashing
 */
contract SensorData is STOTAccessControl {
    
    using ECDSA for bytes32;
    
    struct SensorReading {
        string transportId;
        string organId;
        uint256 timestamp;
        int16 temperature; // in Celsius * 100 (e.g., 450 = 4.5°C)
        uint16 humidity;   // in percentage * 100 (e.g., 5500 = 55.0%)
        uint16 pressure;   // in hPa
        uint32 altitude;   // in meters
        int32 latitude;    // in degrees * 1e6
        int32 longitude;   // in degrees * 1e6
        uint16 speed;      // in m/s * 100
        uint16 batteryLevel; // in percentage * 100
        int16 signalStrength; // in dBm
        uint16 vibrationLevel; // in g * 100
        uint16 lightIntensity; // in lux
        bytes32 dataHash;
        bool isValid;
    }
    
    struct AlertThreshold {
        int16 minTemperature;
        int16 maxTemperature;
        uint16 minHumidity;
        uint16 maxHumidity;
        uint16 maxVibration;
        uint16 minBatteryLevel;
    }
    
    // State variables
    mapping(string => SensorReading[]) public sensorReadings;
    mapping(string => AlertThreshold) public alertThresholds;
    mapping(bytes32 => bool) public processedHashes;
    
    // Events
    event SensorDataRecorded(
        string indexed transportId,
        string indexed organId,
        uint256 timestamp,
        bytes32 indexed dataHash
    );
    
    event AlertThresholdSet(
        string indexed organId,
        int16 minTemperature,
        int16 maxTemperature,
        uint16 minHumidity,
        uint16 maxHumidity
    );
    
    event AlertTriggered(
        string indexed transportId,
        string indexed organId,
        string alertType,
        uint256 timestamp
    );
    
    event DataHashProcessed(bytes32 indexed dataHash);
    
    // Modifiers
    modifier onlySensorOrOperator() {
        require(
            hasRole(SENSOR_ROLE, msg.sender) || hasRole(OPERATOR_ROLE, msg.sender),
            "SensorData: Only sensor or operator can call this function"
        );
        _;
    }
    
    modifier onlyHospitalOrAuthority() {
        require(
            hasRole(HOSPITAL_ROLE, msg.sender) || hasRole(AUTHORITY_ROLE, msg.sender),
            "SensorData: Only hospital or authority can call this function"
        );
        _;
    }
    
    constructor() {
        // Set default alert thresholds
        AlertThreshold memory defaultThreshold = AlertThreshold({
            minTemperature: 200,  // 2.0°C
            maxTemperature: 800,  // 8.0°C
            minHumidity: 4500,    // 45.0%
            maxHumidity: 6500,    // 65.0%
            maxVibration: 500,    // 5.0g
            minBatteryLevel: 2000 // 20.0%
        });
        
        alertThresholds["default"] = defaultThreshold;
    }
    
    /**
     * @dev Record sensor data for a transport
     */
    function recordSensorData(
        string memory transportId,
        string memory organId,
        int16 temperature,
        uint16 humidity,
        uint16 pressure,
        uint32 altitude,
        int32 latitude,
        int32 longitude,
        uint16 speed,
        uint16 batteryLevel,
        int16 signalStrength,
        uint16 vibrationLevel,
        uint16 lightIntensity
    ) public onlySensorOrOperator whenNotPaused {
        
        uint256 timestamp = block.timestamp;
        
        // Create data hash
        bytes32 dataHash = keccak256(abi.encodePacked(
            transportId,
            organId,
            timestamp,
            temperature,
            humidity,
            pressure,
            altitude,
            latitude,
            longitude,
            speed,
            batteryLevel,
            signalStrength,
            vibrationLevel,
            lightIntensity
        ));
        
        // Check if hash already processed
        require(!processedHashes[dataHash], "SensorData: Data hash already processed");
        
        // Create sensor reading
        SensorReading memory reading = SensorReading({
            transportId: transportId,
            organId: organId,
            timestamp: timestamp,
            temperature: temperature,
            humidity: humidity,
            pressure: pressure,
            altitude: altitude,
            latitude: latitude,
            longitude: longitude,
            speed: speed,
            batteryLevel: batteryLevel,
            signalStrength: signalStrength,
            vibrationLevel: vibrationLevel,
            lightIntensity: lightIntensity,
            dataHash: dataHash,
            isValid: true
        });
        
        // Store reading
        sensorReadings[transportId].push(reading);
        processedHashes[dataHash] = true;
        
        // Check for alerts
        checkAlerts(transportId, organId, reading);
        
        emit SensorDataRecorded(transportId, organId, timestamp, dataHash);
        emit DataHashProcessed(dataHash);
    }
    
    /**
     * @dev Set alert thresholds for an organ
     */
    function setAlertThresholds(
        string memory organId,
        int16 minTemperature,
        int16 maxTemperature,
        uint16 minHumidity,
        uint16 maxHumidity,
        uint16 maxVibration,
        uint16 minBatteryLevel
    ) public onlyHospitalOrAuthority {
        
        AlertThreshold memory threshold = AlertThreshold({
            minTemperature: minTemperature,
            maxTemperature: maxTemperature,
            minHumidity: minHumidity,
            maxHumidity: maxHumidity,
            maxVibration: maxVibration,
            minBatteryLevel: minBatteryLevel
        });
        
        alertThresholds[organId] = threshold;
        
        emit AlertThresholdSet(
            organId,
            minTemperature,
            maxTemperature,
            minHumidity,
            maxHumidity
        );
    }
    
    /**
     * @dev Check for alerts based on sensor readings
     */
    function checkAlerts(
        string memory transportId,
        string memory organId,
        SensorReading memory reading
    ) internal {
        AlertThreshold memory threshold = alertThresholds[organId];
        
        // Use default threshold if organ-specific not set
        if (threshold.minTemperature == 0 && threshold.maxTemperature == 0) {
            threshold = alertThresholds["default"];
        }
        
        // Temperature alerts
        if (reading.temperature < threshold.minTemperature) {
            emit AlertTriggered(transportId, organId, "LOW_TEMPERATURE", reading.timestamp);
        }
        if (reading.temperature > threshold.maxTemperature) {
            emit AlertTriggered(transportId, organId, "HIGH_TEMPERATURE", reading.timestamp);
        }
        
        // Humidity alerts
        if (reading.humidity < threshold.minHumidity) {
            emit AlertTriggered(transportId, organId, "LOW_HUMIDITY", reading.timestamp);
        }
        if (reading.humidity > threshold.maxHumidity) {
            emit AlertTriggered(transportId, organId, "HIGH_HUMIDITY", reading.timestamp);
        }
        
        // Vibration alerts
        if (reading.vibrationLevel > threshold.maxVibration) {
            emit AlertTriggered(transportId, organId, "HIGH_VIBRATION", reading.timestamp);
        }
        
        // Battery alerts
        if (reading.batteryLevel < threshold.minBatteryLevel) {
            emit AlertTriggered(transportId, organId, "LOW_BATTERY", reading.timestamp);
        }
    }
    
    /**
     * @dev Get sensor readings for a transport
     */
    function getSensorReadings(string memory transportId) 
        public 
        view 
        returns (SensorReading[] memory) 
    {
        return sensorReadings[transportId];
    }
    
    /**
     * @dev Get latest sensor reading for a transport
     */
    function getLatestReading(string memory transportId) 
        public 
        view 
        returns (SensorReading memory) 
    {
        SensorReading[] memory readings = sensorReadings[transportId];
        require(readings.length > 0, "SensorData: No readings found for transport");
        return readings[readings.length - 1];
    }
    
    /**
     * @dev Get alert thresholds for an organ
     */
    function getAlertThresholds(string memory organId) 
        public 
        view 
        returns (AlertThreshold memory) 
    {
        AlertThreshold memory threshold = alertThresholds[organId];
        if (threshold.minTemperature == 0 && threshold.maxTemperature == 0) {
            return alertThresholds["default"];
        }
        return threshold;
    }
    
    /**
     * @dev Verify data hash exists
     */
    function isDataHashProcessed(bytes32 dataHash) public view returns (bool) {
        return processedHashes[dataHash];
    }
    
    /**
     * @dev Get reading count for a transport
     */
    function getReadingCount(string memory transportId) public view returns (uint256) {
        return sensorReadings[transportId].length;
    }
} 