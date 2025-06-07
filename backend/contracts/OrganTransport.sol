// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title OrganTransport
 * @dev Manages organ transport records on the blockchain
 */
contract OrganTransport is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant TRANSPORT_ROLE = keccak256("TRANSPORT_ROLE");

    struct Transport {
        string organId;
        string sourceHospital;
        string destinationHospital;
        uint256 timestamp;
        string status;
        address initiator;
        mapping(uint256 => StatusUpdate) statusUpdates;
        uint256 updateCount;
    }

    struct StatusUpdate {
        string status;
        uint256 timestamp;
        address updater;
    }

    // Mapping from transport ID to Transport struct
    mapping(uint256 => Transport) public transports;
    uint256 public transportCount;

    // Events
    event TransportInitiated(
        uint256 indexed transportId,
        string organId,
        string sourceHospital,
        string destinationHospital,
        uint256 timestamp
    );

    event StatusUpdated(
        uint256 indexed transportId,
        string status,
        uint256 timestamp,
        address updater
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Initiates a new organ transport
     * @param organId Unique identifier for the organ
     * @param sourceHospital Source hospital identifier
     * @param destinationHospital Destination hospital identifier
     */
    function initiateTransport(
        string memory organId,
        string memory sourceHospital,
        string memory destinationHospital
    ) public whenNotPaused onlyRole(HOSPITAL_ROLE) returns (uint256) {
        transportCount++;
        uint256 transportId = transportCount;

        Transport storage newTransport = transports[transportId];
        newTransport.organId = organId;
        newTransport.sourceHospital = sourceHospital;
        newTransport.destinationHospital = destinationHospital;
        newTransport.timestamp = block.timestamp;
        newTransport.status = "initiated";
        newTransport.initiator = msg.sender;
        newTransport.updateCount = 0;

        // Add initial status update
        addStatusUpdate(transportId, "initiated");

        emit TransportInitiated(
            transportId,
            organId,
            sourceHospital,
            destinationHospital,
            block.timestamp
        );

        return transportId;
    }

    /**
     * @dev Updates the status of an organ transport
     * @param transportId ID of the transport to update
     * @param status New status to set
     */
    function updateStatus(uint256 transportId, string memory status)
        public
        whenNotPaused
        onlyRole(TRANSPORT_ROLE)
    {
        require(transportId <= transportCount, "Transport does not exist");
        addStatusUpdate(transportId, status);
    }

    /**
     * @dev Internal function to add a status update
     */
    function addStatusUpdate(uint256 transportId, string memory status) internal {
        Transport storage transport = transports[transportId];
        uint256 updateIndex = transport.updateCount;
        
        transport.statusUpdates[updateIndex] = StatusUpdate({
            status: status,
            timestamp: block.timestamp,
            updater: msg.sender
        });
        
        transport.status = status;
        transport.updateCount++;

        emit StatusUpdated(
            transportId,
            status,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Gets the current status of a transport
     */
    function getTransportStatus(uint256 transportId)
        public
        view
        returns (
            string memory organId,
            string memory sourceHospital,
            string memory destinationHospital,
            string memory status,
            uint256 timestamp,
            address initiator
        )
    {
        require(transportId <= transportCount, "Transport does not exist");
        Transport storage transport = transports[transportId];
        return (
            transport.organId,
            transport.sourceHospital,
            transport.destinationHospital,
            transport.status,
            transport.timestamp,
            transport.initiator
        );
    }

    /**
     * @dev Gets a specific status update for a transport
     */
    function getStatusUpdate(uint256 transportId, uint256 updateIndex)
        public
        view
        returns (string memory status, uint256 timestamp, address updater)
    {
        require(transportId <= transportCount, "Transport does not exist");
        Transport storage transport = transports[transportId];
        require(updateIndex < transport.updateCount, "Update index out of bounds");
        
        StatusUpdate storage update = transport.statusUpdates[updateIndex];
        return (update.status, update.timestamp, update.updater);
    }

    /**
     * @dev Gets the number of status updates for a transport
     */
    function getUpdateCount(uint256 transportId) public view returns (uint256) {
        require(transportId <= transportCount, "Transport does not exist");
        return transports[transportId].updateCount;
    }

    /**
     * @dev Pauses the contract
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }
} 