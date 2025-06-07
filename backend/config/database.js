const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/stot.db');

function initDatabase() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return;
    }
    console.log('Connected to SQLite database');
    
    // Create tables
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Organs table
      db.run(`CREATE TABLE IF NOT EXISTS organs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        donor_hospital TEXT NOT NULL,
        recipient_hospital TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Transport table
      db.run(`CREATE TABLE IF NOT EXISTS transports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organ_id INTEGER NOT NULL,
        uav_id TEXT NOT NULL,
        start_time DATETIME,
        end_time DATETIME,
        status TEXT NOT NULL,
        blockchain_hash TEXT,
        FOREIGN KEY (organ_id) REFERENCES organs (id)
      )`);

      // Sensor readings table
      db.run(`CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transport_id INTEGER NOT NULL,
        temperature REAL,
        humidity REAL,
        pressure REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transport_id) REFERENCES transports (id)
      )`);
    });
  });

  return db;
}

module.exports = initDatabase; 