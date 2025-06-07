-- Drop existing tables if they exist
DROP TABLE IF EXISTS sensor_readings;
DROP TABLE IF EXISTS transports;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organs;

-- Create users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create organs table
CREATE TABLE organs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organ_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    donor_hospital TEXT NOT NULL,
    recipient_hospital TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create transports table
CREATE TABLE transports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transport_id TEXT UNIQUE NOT NULL,
    organ_id TEXT NOT NULL,
    source_hospital TEXT NOT NULL,
    destination_hospital TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organ_id) REFERENCES organs(organ_id)
);

-- Create sensor_readings table
CREATE TABLE sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transport_id TEXT NOT NULL,
    temperature REAL,
    humidity REAL,
    gps_lat REAL,
    gps_lng REAL,
    shock REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_id) REFERENCES transports(transport_id)
);

-- Insert seed data for users
INSERT INTO users (email, password, role) VALUES
('hospital@stotub.com', '$2a$10$YourHashedPasswordHere', 'hospital'),
('opo@stotub.com', '$2a$10$YourHashedPasswordHere', 'opo'); 