const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stot_ub',
};

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Update organs table status ENUM
    await connection.execute(`
      ALTER TABLE organs 
      MODIFY COLUMN status ENUM('pending', 'container_assigned', 'sealed', 'in_transit', 'delivered', 'failed', 'cancelled') 
      DEFAULT 'pending'
    `);
    console.log('Updated organs table status ENUM');

    // Update transports table status ENUM
    await connection.execute(`
      ALTER TABLE transports 
      MODIFY COLUMN status ENUM('pending', 'in_transit', 'arrived', 'completed', 'delivered', 'failed', 'cancelled') 
      DEFAULT 'pending'
    `);
    console.log('Updated transports table status ENUM');

    // Update blockchain_events table event_type ENUM
    await connection.execute(`
      ALTER TABLE blockchain_events 
      MODIFY COLUMN event_type ENUM(
        'organ_registered', 
        'transport_started', 
        'transport_updated', 
        'transport_completed', 
        'transport_arrived',
        'container_assigned',
        'container_sealed',
        'container_unsealed',
        'alert_resolved',
        'emergency_stop'
      )
    `);
    console.log('Updated blockchain_events table event_type ENUM');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate(); 