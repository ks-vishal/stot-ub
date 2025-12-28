-- STOT-UB Database Schema
-- Secure and Transparent Organ Transportation System

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS stot_ub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stot_ub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'operator', 'doctor', 'coordinator') NOT NULL DEFAULT 'operator',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- UAVs table
CREATE TABLE IF NOT EXISTS uavs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uav_id VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    max_payload DECIMAL(5,2) NOT NULL, -- in kg
    max_range DECIMAL(8,2) NOT NULL, -- in km
    max_flight_time INT NOT NULL, -- in minutes
    battery_capacity DECIMAL(5,2) NOT NULL, -- in Ah
    current_battery DECIMAL(5,2) NOT NULL,
    status ENUM('available', 'in_use', 'maintenance', 'offline') DEFAULT 'available',
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    altitude DECIMAL(8,2), -- in meters
    speed DECIMAL(5,2), -- in m/s
    operator_id INT,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_flight_hours INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_uav_id (uav_id),
    INDEX idx_status (status),
    INDEX idx_operator (operator_id)
);

-- Organs table
CREATE TABLE IF NOT EXISTS organs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organ_id VARCHAR(50) UNIQUE NOT NULL,
    organ_type ENUM('heart', 'liver', 'kidney', 'lung', 'pancreas', 'intestine') NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    donor_id VARCHAR(100) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    donor_hospital VARCHAR(200) NOT NULL,
    recipient_hospital VARCHAR(200) NOT NULL,
    donor_location_lat DECIMAL(10,8) NOT NULL,
    donor_location_lng DECIMAL(11,8) NOT NULL,
    recipient_location_lat DECIMAL(10,8) NOT NULL,
    recipient_location_lng DECIMAL(11,8) NOT NULL,
    priority_level ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_transit', 'delivered', 'failed', 'cancelled') DEFAULT 'pending',
    preservation_time_limit INT NOT NULL, -- in hours
    current_temperature DECIMAL(4,2), -- in Celsius
    current_humidity DECIMAL(5,2), -- in percentage
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    assigned_uav_id VARCHAR(50),
    assigned_operator_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_uav_id) REFERENCES uavs(uav_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_operator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_organ_id (organ_id),
    INDEX idx_status (status),
    INDEX idx_organ_type (organ_type),
    INDEX idx_priority (priority_level)
);

-- Transports table
CREATE TABLE IF NOT EXISTS transports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transport_id VARCHAR(50) UNIQUE NOT NULL,
    organ_id VARCHAR(50) NOT NULL,
    uav_id VARCHAR(50) NOT NULL,
    operator_id INT NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP NULL,
    estimated_duration INT, -- in minutes
    actual_duration INT, -- in minutes
    start_location_lat DECIMAL(10,8) NOT NULL,
    start_location_lng DECIMAL(11,8) NOT NULL,
    end_location_lat DECIMAL(10,8),
    end_location_lng DECIMAL(11,8),
    status ENUM('pending', 'in_transit', 'delivered', 'failed', 'cancelled') DEFAULT 'pending',
    distance_covered DECIMAL(8,2), -- in km
    average_speed DECIMAL(5,2), -- in m/s
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organ_id) REFERENCES organs(organ_id) ON DELETE CASCADE,
    FOREIGN KEY (uav_id) REFERENCES uavs(uav_id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transport_id (transport_id),
    INDEX idx_organ_id (organ_id),
    INDEX idx_uav_id (uav_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
);

-- Sensor data table
CREATE TABLE IF NOT EXISTS sensor_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transport_id VARCHAR(50) NOT NULL,
    uav_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature DECIMAL(4,2) NOT NULL, -- in Celsius
    humidity DECIMAL(5,2) NOT NULL, -- in percentage
    pressure DECIMAL(6,2) NOT NULL, -- in hPa
    altitude DECIMAL(8,2) NOT NULL, -- in meters
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2), -- in m/s
    battery_level DECIMAL(5,2), -- in percentage
    signal_strength INT, -- in dBm
    vibration_level DECIMAL(4,2), -- in g
    light_intensity INT, -- in lux
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_id) REFERENCES transports(transport_id) ON DELETE CASCADE,
    FOREIGN KEY (uav_id) REFERENCES uavs(uav_id) ON DELETE CASCADE,
    INDEX idx_transport_id (transport_id),
    INDEX idx_uav_id (uav_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_location (latitude, longitude),
    UNIQUE KEY unique_sensor_reading (transport_id, uav_id, timestamp)
);

-- Blockchain events table
CREATE TABLE IF NOT EXISTS blockchain_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type ENUM('organ_registered', 'transport_started', 'transport_updated', 'transport_completed', 'emergency_stop') NOT NULL,
    transport_id VARCHAR(50),
    organ_id VARCHAR(50),
    uav_id VARCHAR(50),
    operator_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    event_data JSON,
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (transport_id) REFERENCES transports(transport_id) ON DELETE SET NULL,
    FOREIGN KEY (organ_id) REFERENCES organs(organ_id) ON DELETE SET NULL,
    FOREIGN KEY (uav_id) REFERENCES uavs(uav_id) ON DELETE SET NULL,
    INDEX idx_event_type (event_type),
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_transport_id (transport_id),
    INDEX idx_status (status)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type ENUM('temperature', 'humidity', 'battery', 'location', 'speed', 'maintenance', 'emergency') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    transport_id VARCHAR(50),
    uav_id VARCHAR(50),
    organ_id VARCHAR(50),
    message TEXT NOT NULL,
    sensor_data JSON,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by INT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_id) REFERENCES transports(transport_id) ON DELETE CASCADE,
    FOREIGN KEY (uav_id) REFERENCES uavs(uav_id) ON DELETE CASCADE,
    FOREIGN KEY (organ_id) REFERENCES organs(organ_id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_transport_id (transport_id),
    INDEX idx_is_resolved (is_resolved)
);

-- Maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uav_id VARCHAR(50) NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'inspection', 'upgrade') NOT NULL,
    description TEXT NOT NULL,
    performed_by INT NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_maintenance_date DATE,
    cost DECIMAL(10,2),
    parts_replaced JSON,
    notes TEXT,
    FOREIGN KEY (uav_id) REFERENCES uavs(uav_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uav_id (uav_id),
    INDEX idx_maintenance_type (maintenance_type),
    INDEX idx_performed_at (performed_at)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user
INSERT IGNORE INTO users (username, email, password_hash, role, first_name, last_name) 
VALUES ('admin', 'admin@stot-ub.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'admin', 'System', 'Administrator');

-- Insert sample UAVs
INSERT IGNORE INTO uavs (uav_id, model, manufacturer, max_payload, max_range, max_flight_time, battery_capacity, current_battery, status) VALUES
('UAV-001', 'DJI Matrice 600 Pro', 'DJI', 6.0, 5.0, 40, 6.0, 6.0, 'available'),
('UAV-002', 'DJI Matrice 600 Pro', 'DJI', 6.0, 5.0, 40, 6.0, 6.0, 'available'),
('UAV-003', 'DJI Matrice 600 Pro', 'DJI', 6.0, 5.0, 40, 6.0, 6.0, 'available'),
('UAV-004', 'DJI Matrice 600 Pro', 'DJI', 6.0, 5.0, 40, 6.0, 6.0, 'available'),
('UAV-005', 'DJI Matrice 600 Pro', 'DJI', 6.0, 5.0, 40, 6.0, 6.0, 'available'); 