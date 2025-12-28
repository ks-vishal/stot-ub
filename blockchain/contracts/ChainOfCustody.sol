// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ChainOfCustody
 * @dev Immutable chain of custody tracking for organ transportation
 */
contract ChainOfCustody is STOTAccessControl {
    
    using ECDSA for bytes32;
    
    struct CustodyEvent {
        string organId;
        string transportId;
        address fromParty;
        address toParty;
        uint256 timestamp;
        CustodyEventType eventType;
        string location;
        string notes;
        bytes32 eventHash;
        bool isValid;
    }
    
    struct CustodyChain {
        string organId;
        CustodyEvent[] events;
        address currentCustodian;
        uint256 lastEventTimestamp;
        bool isActive;
    }
    
    enum CustodyEventType {
        Donation,
        HospitalPickup,
        TransportStart,
        TransportInTransit,
        TransportComplete,
        HospitalDelivery,
        Transplant,
        EmergencyTransfer,
        ReturnToDonor
    }
    
    // State variables
    mapping(string => CustodyChain) public custodyChains;
    mapping(bytes32 => bool) public processedEventHashes;
    mapping(string => address) public organCustodians;
    
    // Events
    event CustodyEventRecorded(
        string indexed organId,
        string indexed transportId,
        address indexed fromParty,
        address toParty,
        CustodyEventType eventType,
        uint256 timestamp,
        bytes32 eventHash
    );
    
    event CustodyChainCreated(
        string indexed organId,
        address indexed initialCustodian,
        uint256 timestamp
    );
    
    event CustodyChainCompleted(
        string indexed organId,
        address indexed finalCustodian,
        uint256 timestamp
    );
    
    event EmergencyTransfer(
        string indexed organId,
        address indexed fromParty,
        address indexed toParty,
        string reason,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyAuthorizedParty() {
        require(
            hasRole(HOSPITAL_ROLE, msg.sender) || 
            hasRole(TRANSPORT_ROLE, msg.sender) || 
            hasRole(AUTHORITY_ROLE, msg.sender),
            "ChainOfCustody: Only authorized parties can record custody events"
        );
        _;
    }
    
    modifier onlyCurrentCustodian(string memory organId) {
        require(
            organCustodians[organId] == msg.sender,
            "ChainOfCustody: Only current custodian can transfer custody"
        );
        _;
    }
    
    modifier custodyChainExists(string memory organId) {
        require(custodyChains[organId].isActive, "ChainOfCustody: Custody chain does not exist");
        _;
    }
    
    /**
     * @dev Create a new custody chain for an organ
     */
    function createCustodyChain(
        string memory organId,
        address initialCustodian,
        string memory location,
        string memory notes
    ) public onlyAuthorizedParty whenNotPaused {
        require(!custodyChains[organId].isActive, "ChainOfCustody: Custody chain already exists");
        
        CustodyChain storage chain = custodyChains[organId];
        chain.organId = organId;
        chain.currentCustodian = initialCustodian;
        chain.lastEventTimestamp = block.timestamp;
        chain.isActive = true;
        
        organCustodians[organId] = initialCustodian;
        
        // Record initial donation event
        recordCustodyEvent(
            organId,
            "",
            address(0),
            initialCustodian,
            CustodyEventType.Donation,
            location,
            notes
        );
        
        emit CustodyChainCreated(organId, initialCustodian, block.timestamp);
    }
    
    /**
     * @dev Record a custody transfer event
     */
    function recordCustodyEvent(
        string memory organId,
        string memory transportId,
        address fromParty,
        address toParty,
        CustodyEventType eventType,
        string memory location,
        string memory notes
    ) public onlyAuthorizedParty whenNotPaused {
        require(custodyChains[organId].isActive, "ChainOfCustody: Custody chain does not exist");
        
        uint256 timestamp = block.timestamp;
        
        // Create event hash
        bytes32 eventHash = keccak256(abi.encodePacked(
            organId,
            transportId,
            fromParty,
            toParty,
            timestamp,
            uint8(eventType),
            location,
            notes
        ));
        
        // Check if event hash already processed
        require(!processedEventHashes[eventHash], "ChainOfCustody: Event hash already processed");
        
        // Create custody event
        CustodyEvent memory custodyEvent = CustodyEvent({
            organId: organId,
            transportId: transportId,
            fromParty: fromParty,
            toParty: toParty,
            timestamp: timestamp,
            eventType: eventType,
            location: location,
            notes: notes,
            eventHash: eventHash,
            isValid: true
        });
        
        // Add event to chain
        custodyChains[organId].events.push(custodyEvent);
        custodyChains[organId].lastEventTimestamp = timestamp;
        
        // Update current custodian
        if (toParty != address(0)) {
            custodyChains[organId].currentCustodian = toParty;
            organCustodians[organId] = toParty;
        }
        
        processedEventHashes[eventHash] = true;
        
        emit CustodyEventRecorded(
            organId,
            transportId,
            fromParty,
            toParty,
            eventType,
            timestamp,
            eventHash
        );
    }
    
    /**
     * @dev Transfer custody to another party
     */
    function transferCustody(
        string memory organId,
        string memory transportId,
        address toParty,
        CustodyEventType eventType,
        string memory location,
        string memory notes
    ) public onlyCurrentCustodian(organId) whenNotPaused {
        require(toParty != address(0), "ChainOfCustody: Invalid recipient address");
        
        recordCustodyEvent(
            organId,
            transportId,
            msg.sender,
            toParty,
            eventType,
            location,
            notes
        );
    }
    
    /**
     * @dev Emergency custody transfer (authority only)
     */
    function emergencyTransfer(
        string memory organId,
        address toParty,
        string memory reason
    ) public onlyRole(AUTHORITY_ROLE) whenNotPaused {
        require(custodyChains[organId].isActive, "ChainOfCustody: Custody chain does not exist");
        require(toParty != address(0), "ChainOfCustody: Invalid recipient address");
        
        address fromParty = custodyChains[organId].currentCustodian;
        
        recordCustodyEvent(
            organId,
            "",
            fromParty,
            toParty,
            CustodyEventType.EmergencyTransfer,
            "Emergency Location",
            reason
        );
        
        emit EmergencyTransfer(organId, fromParty, toParty, reason, block.timestamp);
    }
    
    /**
     * @dev Complete custody chain (final delivery)
     */
    function completeCustodyChain(
        string memory organId,
        string memory location,
        string memory notes
    ) public onlyCurrentCustodian(organId) whenNotPaused {
        require(custodyChains[organId].isActive, "ChainOfCustody: Custody chain does not exist");
        
        recordCustodyEvent(
            organId,
            "",
            msg.sender,
            address(0),
            CustodyEventType.Transplant,
            location,
            notes
        );
        
        // Mark chain as completed
        custodyChains[organId].isActive = false;
        
        emit CustodyChainCompleted(organId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get complete custody chain for an organ
     */
    function getCustodyChain(string memory organId) 
        public 
        view 
        returns (CustodyChain memory) 
    {
        return custodyChains[organId];
    }
    
    /**
     * @dev Get custody events for an organ
     */
    function getCustodyEvents(string memory organId) 
        public 
        view 
        returns (CustodyEvent[] memory) 
    {
        return custodyChains[organId].events;
    }
    
    /**
     * @dev Get current custodian for an organ
     */
    function getCurrentCustodian(string memory organId) 
        public 
        view 
        returns (address) 
    {
        return custodyChains[organId].currentCustodian;
    }
    
    /**
     * @dev Get custody chain status
     */
    function isCustodyChainActive(string memory organId) 
        public 
        view 
        returns (bool) 
    {
        return custodyChains[organId].isActive;
    }
    
    /**
     * @dev Get event count for an organ
     */
    function getEventCount(string memory organId) 
        public 
        view 
        returns (uint256) 
    {
        return custodyChains[organId].events.length;
    }
    
    /**
     * @dev Verify event hash exists
     */
    function isEventHashProcessed(bytes32 eventHash) 
        public 
        view 
        returns (bool) 
    {
        return processedEventHashes[eventHash];
    }
    
    /**
     * @dev Get custody chain summary
     */
    function getCustodySummary(string memory organId) 
        public 
        view 
        returns (
            address currentCustodian,
            uint256 eventCount,
            uint256 lastEventTimestamp,
            bool isActive
        ) 
    {
        CustodyChain memory chain = custodyChains[organId];
        return (
            chain.currentCustodian,
            chain.events.length,
            chain.lastEventTimestamp,
            chain.isActive
        );
    }
} 