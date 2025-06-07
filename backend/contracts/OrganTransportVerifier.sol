// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title OrganTransportVerifier
 * @dev Smart contract for verifying and tracking organ transport conditions
 */
contract OrganTransportVerifier is AccessControl, Pausable {
    // Role definitions
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant OPO_ROLE = keccak256("OPO_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");

    // Struct to store sensor data
    struct SensorData {
        uint256 timestamp;
        int8 temperature;    // Temperature in Celsius * 10 (e.g., 4.5°C = 45)
        uint8 humidity;      // Humidity percentage
        bytes32 dataHash;    // Hash of complete sensor data including GPS
    }

    // Struct to store transport details
    struct Transport {
        string organId;
        address sourceHospital;
        address destinationHospital;
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
        bool isValid;
        SensorData[] sensorUpdates;
    }

    // Mapping from transport ID to Transport struct
    mapping(uint256 => Transport) public transports;
    // Mapping from organ ID to transport IDs
    mapping(string => uint256[]) public organTransports;
    
    // Counter for transport IDs
    uint256 private _transportIdCounter;

    // Events
    event TransportInitiated(
        uint256 indexed transportId,
        string organId,
        address sourceHospital,
        address destinationHospital
    );
    
    event SensorDataUpdated(
        uint256 indexed transportId,
        int8 temperature,
        uint8 humidity,
        bytes32 dataHash
    );
    
    event AlertTriggered(
        uint256 indexed transportId,
        string alertType,
        string message
    );
    
    event TransportCompleted(
        uint256 indexed transportId,
        bool isValid
    );

    // Constants for validation
    int8 public constant MAX_TEMPERATURE = 50;  // 5.0°C
    uint8 public constant MIN_HUMIDITY = 50;
    uint8 public constant MAX_HUMIDITY = 70;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Modifier to check if transport exists
     */
    modifier transportExists(uint256 transportId) {
        require(transports[transportId].startTime != 0, "Transport does not exist");
        _;
    }

    /**
     * @dev Modifier to check if transport is active
     */
    modifier transportActive(uint256 transportId) {
        require(!transports[transportId].isCompleted, "Transport already completed");
        _;
    }

    /**
     * @dev Initiate a new organ transport
     */
    function initiateTransport(
        string memory organId,
        address sourceHospital,
        address destinationHospital
    ) external onlyRole(HOSPITAL_ROLE) whenNotPaused returns (uint256) {
        require(bytes(organId).length > 0, "Invalid organ ID");
        require(sourceHospital != address(0), "Invalid source hospital");
        require(destinationHospital != address(0), "Invalid destination hospital");

        uint256 transportId = _transportIdCounter++;
        
        Transport storage transport = transports[transportId];
        transport.organId = organId;
        transport.sourceHospital = sourceHospital;
        transport.destinationHospital = destinationHospital;
        transport.startTime = block.timestamp;
        transport.isValid = true;

        organTransports[organId].push(transportId);

        emit TransportInitiated(transportId, organId, sourceHospital, destinationHospital);
        return transportId;
    }

    /**
     * @dev Update sensor data for a transport
     */
    function updateSensorData(
        uint256 transportId,
        int8 temperature,
        uint8 humidity,
        bytes32 dataHash
    ) external onlyRole(TRANSPORTER_ROLE) 
      whenNotPaused 
      transportExists(transportId) 
      transportActive(transportId) {
        
        Transport storage transport = transports[transportId];
        
        SensorData memory newData = SensorData({
            timestamp: block.timestamp,
            temperature: temperature,
            humidity: humidity,
            dataHash: dataHash
        });
        
        transport.sensorUpdates.push(newData);
        
        emit SensorDataUpdated(transportId, temperature, humidity, dataHash);
        
        // Verify conditions and emit alerts if needed
        _verifySensorData(transportId, temperature, humidity);
    }

    /**
     * @dev Complete a transport
     */
    function completeTransport(
        uint256 transportId
    ) external onlyRole(HOSPITAL_ROLE) 
      whenNotPaused 
      transportExists(transportId) 
      transportActive(transportId) {
        
        Transport storage transport = transports[transportId];
        require(
            msg.sender == transport.destinationHospital,
            "Only destination hospital can complete transport"
        );

        transport.isCompleted = true;
        transport.endTime = block.timestamp;

        emit TransportCompleted(transportId, transport.isValid);
    }

    /**
     * @dev Get transport details
     */
    function getTransport(uint256 transportId) external view returns (
        string memory organId,
        address sourceHospital,
        address destinationHospital,
        uint256 startTime,
        uint256 endTime,
        bool isCompleted,
        bool isValid,
        uint256 updateCount
    ) {
        Transport storage transport = transports[transportId];
        return (
            transport.organId,
            transport.sourceHospital,
            transport.destinationHospital,
            transport.startTime,
            transport.endTime,
            transport.isCompleted,
            transport.isValid,
            transport.sensorUpdates.length
        );
    }

    /**
     * @dev Get sensor update at specific index
     */
    function getSensorUpdate(
        uint256 transportId,
        uint256 updateIndex
    ) external view returns (
        uint256 timestamp,
        int8 temperature,
        uint8 humidity,
        bytes32 dataHash
    ) {
        Transport storage transport = transports[transportId];
        require(updateIndex < transport.sensorUpdates.length, "Invalid update index");
        
        SensorData storage update = transport.sensorUpdates[updateIndex];
        return (
            update.timestamp,
            update.temperature,
            update.humidity,
            update.dataHash
        );
    }

    /**
     * @dev Get all transport IDs for an organ
     */
    function getOrganTransports(string memory organId) external view returns (uint256[] memory) {
        return organTransports[organId];
    }

    /**
     * @dev Internal function to verify sensor data
     */
    function _verifySensorData(
        uint256 transportId,
        int8 temperature,
        uint8 humidity
    ) internal {
        Transport storage transport = transports[transportId];
        
        if (temperature > MAX_TEMPERATURE) {
            transport.isValid = false;
            emit AlertTriggered(
                transportId,
                "Temperature",
                "Temperature exceeded maximum limit"
            );
        }
        
        if (humidity < MIN_HUMIDITY || humidity > MAX_HUMIDITY) {
            transport.isValid = false;
            emit AlertTriggered(
                transportId,
                "Humidity",
                "Humidity outside acceptable range"
            );
        }
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
} 