const db = require('../models');

async function initializeDatabase(force = false) {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established.');
    await db.sequelize.sync({ force });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to initialize the database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  // Run with: node src/database/init.js [--force]
  const force = process.argv.includes('--force');
  initializeDatabase(force);
}

module.exports = initializeDatabase; 