const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const sequelize = require('../config/sequelize');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stot_ub',
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Remove deprecated options that cause warnings
  // acquireTimeout, timeout, reconnect are not valid for mysql2
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    logger.info('Database connection test successful');
    connection.release();
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error.message);
    return false;
  }
}

// Ping database
async function ping() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('Database ping successful');
  } catch (error) {
    logger.error('Database ping failed:', error.message);
    throw error;
  }
}

// Execute query with parameters
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    logger.error('Database query error:', error.message);
    logger.error('SQL:', sql);
    logger.error('Params:', params);
    throw error;
  }
}

// Execute transaction
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Close all connections
async function close() {
  try {
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  ping,
  query,
  transaction,
  close,
  sequelize
}; 