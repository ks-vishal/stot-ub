// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AccessControl
 * @dev Role-based access control for STOT-UB organ transportation system
 */
contract STOTAccessControl is AccessControl, Pausable {
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant TRANSPORT_ROLE = keccak256("TRANSPORT_ROLE");
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant SENSOR_ROLE = keccak256("SENSOR_ROLE");
    
    // Events (only custom events, not duplicating OpenZeppelin events)
    event ContractPaused(address indexed sender);
    event ContractUnpaused(address indexed sender);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(TRANSPORT_ROLE, msg.sender);
        
        // Set up role hierarchy
        _setRoleAdmin(HOSPITAL_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TRANSPORT_ROLE, ADMIN_ROLE);
        _setRoleAdmin(AUTHORITY_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, TRANSPORT_ROLE);
        _setRoleAdmin(SENSOR_ROLE, TRANSPORT_ROLE);
    }
    
    /**
     * @dev Grant role to account (admin only)
     */
    function grantRole(bytes32 role, address account) public override onlyRole(getRoleAdmin(role)) {
        super.grantRole(role, account);
        // RoleGranted event is already emitted by the parent contract
    }
    
    /**
     * @dev Revoke role from account (admin only)
     */
    function revokeRole(bytes32 role, address account) public override onlyRole(getRoleAdmin(role)) {
        super.revokeRole(role, account);
        // RoleRevoked event is already emitted by the parent contract
    }
    
    /**
     * @dev Pause contract (admin only)
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev Check if account has hospital role
     */
    function isHospital(address account) public view returns (bool) {
        return hasRole(HOSPITAL_ROLE, account);
    }
    
    /**
     * @dev Check if account has transport role
     */
    function isTransport(address account) public view returns (bool) {
        return hasRole(TRANSPORT_ROLE, account);
    }
    
    /**
     * @dev Check if account has authority role
     */
    function isAuthority(address account) public view returns (bool) {
        return hasRole(AUTHORITY_ROLE, account);
    }
    
    /**
     * @dev Check if account has operator role
     */
    function isOperator(address account) public view returns (bool) {
        return hasRole(OPERATOR_ROLE, account);
    }
    
    /**
     * @dev Check if account has sensor role
     */
    function isSensor(address account) public view returns (bool) {
        return hasRole(SENSOR_ROLE, account);
    }
    
    /**
     * @dev Get all roles for an account
     */
    function getAccountRoles(address account) public view returns (bytes32[] memory) {
        bytes32[] memory allRoles = new bytes32[](6);
        allRoles[0] = ADMIN_ROLE;
        allRoles[1] = HOSPITAL_ROLE;
        allRoles[2] = TRANSPORT_ROLE;
        allRoles[3] = AUTHORITY_ROLE;
        allRoles[4] = OPERATOR_ROLE;
        allRoles[5] = SENSOR_ROLE;
        
        uint256 roleCount = 0;
        bytes32[] memory userRoles = new bytes32[](6);
        
        for (uint256 i = 0; i < allRoles.length; i++) {
            if (hasRole(allRoles[i], account)) {
                userRoles[roleCount] = allRoles[i];
                roleCount++;
            }
        }
        
        // Resize array to actual count
        bytes32[] memory result = new bytes32[](roleCount);
        for (uint256 i = 0; i < roleCount; i++) {
            result[i] = userRoles[i];
        }
        
        return result;
    }
} 