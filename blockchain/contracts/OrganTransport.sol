// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./SensorData.sol";
import "./ChainOfCustody.sol";

/**
 * @title OrganTransport
 * @dev Main contract for organ transportation lifecycle management
 */
contract OrganTransport is STOTAccessControl {
    
    struct Organ {
        string organId;
        string organType;
        address donor;
        address recipient;
        address uavOperator;
        uint256 timestamp;
        uint256 temperature;
        uint256 humidity;
        string location;
        TransportStatus status;
        bool exists;
    }
    
    struct Transport {
        string transportId;
        string organId;
        address uavOperator;
        uint256 startTime;
        uint256 endTime;
        string startLocation;
        string endLocation;
        TransportStatus status;
        uint256[] temperatureReadings;
        uint256[] humidityReadings;
        string[] locationUpdates;
        uint256[] timestamps;
        uint256 estimatedDuration;
        uint256 actualDuration;
        uint256 distanceCovered;
        uint256 averageSpeed;
    }
    
    enum TransportStatus {
        Pending,
        InTransit,
        Delivered,
        Failed,
        Cancelled
    }
    
    // Contract interfaces
    SensorData public sensorDataContract;
    ChainOfCustody public chainOfCustodyContract;
    
    // State variables
    mapping(string => Organ) public organs;
    mapping(string => Transport) public transports;
    mapping(address => uint256) public operatorReputation;
    mapping(string => uint256) public transportCount;
    
    // Events
    event OrganRegistered(string indexed organId, string organType, address indexed donor, address indexed recipient);
    event TransportStarted(string indexed transportId, string indexed organId, address indexed uavOperator);
    event TransportUpdated(string indexed transportId, uint256 temperature, uint256 humidity, string location);
    event TransportCompleted(string indexed transportId, TransportStatus status);
    event EmergencyStop(string indexed transportId, string reason);
    event OperatorReputationUpdated(address indexed operator, uint256 newReputation);
    
    // Modifiers
    modifier onlyAuthorizedOperator() {
        require(
            hasRole(OPERATOR_ROLE, msg.sender) || hasRole(TRANSPORT_ROLE, msg.sender),
            "OrganTransport: Not authorized operator"
        );
        _;
    }
    
    modifier organExists(string memory organId) {
        require(organs[organId].exists, "OrganTransport: Organ does not exist");
        _;
    }
    
    modifier transportExists(string memory transportId) {
        require(transports[transportId].startTime > 0, "OrganTransport: Transport does not exist");
        _;
    }
    
    modifier onlyHospitalOrAuthority() {
        require(
            hasRole(HOSPITAL_ROLE, msg.sender) || hasRole(AUTHORITY_ROLE, msg.sender),
            "OrganTransport: Only hospital or authority can call this function"
        );
        _;
    }
    
    constructor(address _sensorDataContract, address _chainOfCustodyContract) {
        sensorDataContract = SensorData(_sensorDataContract);
        chainOfCustodyContract = ChainOfCustody(_chainOfCustodyContract);
    }
    
    /**
     * @dev Register a new organ for transportation
     */
    function registerOrgan(
        string memory organId,
        string memory organType,
        address donor,
        address recipient,
        string memory location,
        string memory notes
    ) external onlyHospitalOrAuthority whenNotPaused {
        require(!organs[organId].exists, "OrganTransport: Organ already exists");
        require(donor != address(0), "OrganTransport: Invalid donor address");
        require(recipient != address(0), "OrganTransport: Invalid recipient address");
        
        organs[organId] = Organ({
            organId: organId,
            organType: organType,
            donor: donor,
            recipient: recipient,
            uavOperator: address(0),
            timestamp: block.timestamp,
            temperature: 0,
            humidity: 0,
            location: location,
            status: TransportStatus.Pending,
            exists: true
        });
        
        // Create custody chain
        chainOfCustodyContract.createCustodyChain(organId, donor, location, notes);
        
        emit OrganRegistered(organId, organType, donor, recipient);
    }
    
    /**
     * @dev Start a transport for an organ
     */
    function startTransport(
        string memory transportId,
        string memory organId,
        string memory startLocation,
        uint256 estimatedDuration
    ) external onlyAuthorizedOperator organExists(organId) whenNotPaused {
        require(organs[organId].status == TransportStatus.Pending, "OrganTransport: Organ not available for transport");
        require(transports[transportId].startTime == 0, "OrganTransport: Transport ID already exists");
        
        organs[organId].status = TransportStatus.InTransit;
        organs[organId].uavOperator = msg.sender;
        organs[organId].location = startLocation;
        
        transports[transportId] = Transport({
            transportId: transportId,
            organId: organId,
            uavOperator: msg.sender,
            startTime: block.timestamp,
            endTime: 0,
            startLocation: startLocation,
            endLocation: "",
            status: TransportStatus.InTransit,
            temperatureReadings: new uint256[](0),
            humidityReadings: new uint256[](0),
            locationUpdates: new string[](0),
            timestamps: new uint256[](0),
            estimatedDuration: estimatedDuration,
            actualDuration: 0,
            distanceCovered: 0,
            averageSpeed: 0
        });
        
        // Record custody transfer
        chainOfCustodyContract.recordCustodyEvent(
            organId,
            transportId,
            organs[organId].donor,
            msg.sender,
            ChainOfCustody.CustodyEventType.TransportStart,
            startLocation,
            "Transport started"
        );
        
        transportCount[organId]++;
        
        emit TransportStarted(transportId, organId, msg.sender);
    }
    
    /**
     * @dev Update transport status with sensor data
     */
    function updateTransport(
        string memory transportId,
        uint256 temperature,
        uint256 humidity,
        string memory location
    ) external onlyAuthorizedOperator transportExists(transportId) whenNotPaused {
        require(transports[transportId].uavOperator == msg.sender, "OrganTransport: Not the transport operator");
        require(transports[transportId].status == TransportStatus.InTransit, "OrganTransport: Transport not in progress");
        
        Transport storage transport = transports[transportId];
        transport.temperatureReadings.push(temperature);
        transport.humidityReadings.push(humidity);
        transport.locationUpdates.push(location);
        transport.timestamps.push(block.timestamp);
        
        // Update organ status
        string memory organId = transport.organId;
        organs[organId].temperature = temperature;
        organs[organId].humidity = humidity;
        organs[organId].location = location;
        
        // Record custody event
        chainOfCustodyContract.recordCustodyEvent(
            organId,
            transportId,
            msg.sender,
            msg.sender,
            ChainOfCustody.CustodyEventType.TransportInTransit,
            location,
            "Transport in progress"
        );
        
        emit TransportUpdated(transportId, temperature, humidity, location);
    }
    
    /**
     * @dev Complete a transport
     */
    function completeTransport(
        string memory transportId,
        string memory endLocation,
        TransportStatus finalStatus,
        uint256 distanceCovered,
        uint256 averageSpeed
    ) external onlyAuthorizedOperator transportExists(transportId) whenNotPaused {
        require(transports[transportId].uavOperator == msg.sender, "OrganTransport: Not the transport operator");
        require(transports[transportId].status == TransportStatus.InTransit, "OrganTransport: Transport not in progress");
        require(finalStatus == TransportStatus.Delivered || finalStatus == TransportStatus.Failed, "OrganTransport: Invalid final status");
        
        Transport storage transport = transports[transportId];
        transport.endTime = block.timestamp;
        transport.endLocation = endLocation;
        transport.status = finalStatus;
        transport.actualDuration = block.timestamp - transport.startTime;
        transport.distanceCovered = distanceCovered;
        transport.averageSpeed = averageSpeed;
        
        // Update organ status
        string memory organId = transport.organId;
        organs[organId].status = finalStatus;
        organs[organId].location = endLocation;
        
        // Record custody transfer
        ChainOfCustody.CustodyEventType eventType = (finalStatus == TransportStatus.Delivered) 
            ? ChainOfCustody.CustodyEventType.TransportComplete 
            : ChainOfCustody.CustodyEventType.EmergencyTransfer;
            
        chainOfCustodyContract.recordCustodyEvent(
            organId,
            transportId,
            msg.sender,
            organs[organId].recipient,
            eventType,
            endLocation,
            finalStatus == TransportStatus.Delivered ? "Transport completed successfully" : "Transport failed"
        );
        
        // Update operator reputation
        if (finalStatus == TransportStatus.Delivered) {
            operatorReputation[msg.sender] += 10;
            emit OperatorReputationUpdated(msg.sender, operatorReputation[msg.sender]);
        } else {
            operatorReputation[msg.sender] = operatorReputation[msg.sender] > 5 ? operatorReputation[msg.sender] - 5 : 0;
            emit OperatorReputationUpdated(msg.sender, operatorReputation[msg.sender]);
        }
        
        emit TransportCompleted(transportId, finalStatus);
    }
    
    /**
     * @dev Emergency stop a transport
     */
    function emergencyStop(string memory transportId, string memory reason) external onlyAuthorizedOperator transportExists(transportId) whenNotPaused {
        require(transports[transportId].uavOperator == msg.sender, "OrganTransport: Not the transport operator");
        require(transports[transportId].status == TransportStatus.InTransit, "OrganTransport: Transport not in progress");
        
        Transport storage transport = transports[transportId];
        transport.status = TransportStatus.Failed;
        transport.endTime = block.timestamp;
        transport.actualDuration = block.timestamp - transport.startTime;
        
        // Update organ status
        string memory organId = transport.organId;
        organs[organId].status = TransportStatus.Failed;
        
        // Record emergency custody transfer
        chainOfCustodyContract.recordCustodyEvent(
            organId,
            transportId,
            msg.sender,
            address(0),
            ChainOfCustody.CustodyEventType.EmergencyTransfer,
            transport.locationUpdates[transport.locationUpdates.length - 1],
            reason
        );
        
        emit EmergencyStop(transportId, reason);
    }
    
    /**
     * @dev Get organ details
     */
    function getOrgan(string memory organId) external view returns (Organ memory) {
        return organs[organId];
    }
    
    /**
     * @dev Get transport details
     */
    function getTransport(string memory transportId) external view returns (Transport memory) {
        return transports[transportId];
    }
    
    /**
     * @dev Get operator reputation
     */
    function getOperatorReputation(address operator) external view returns (uint256) {
        return operatorReputation[operator];
    }
    
    /**
     * @dev Get transport count for an organ
     */
    function getTransportCount(string memory organId) external view returns (uint256) {
        return transportCount[organId];
    }
    
    /**
     * @dev Get all transports for an organ
     */
    function getOrganTransports(string memory organId) external view returns (string[] memory) {
        // This is a simplified version - in practice, you might want to maintain a mapping
        // of organId to transportIds for better efficiency
        return new string[](0);
    }
    
    /**
     * @dev Update sensor data contract address (admin only)
     */
    function updateSensorDataContract(address newAddress) external onlyRole(ADMIN_ROLE) {
        require(newAddress != address(0), "OrganTransport: Invalid address");
        sensorDataContract = SensorData(newAddress);
    }
    
    /**
     * @dev Update chain of custody contract address (admin only)
     */
    function updateChainOfCustodyContract(address newAddress) external onlyRole(ADMIN_ROLE) {
        require(newAddress != address(0), "OrganTransport: Invalid address");
        chainOfCustodyContract = ChainOfCustody(newAddress);
    }
} 