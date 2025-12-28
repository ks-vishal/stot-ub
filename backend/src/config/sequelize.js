const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'stot_ub',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    define: {
      freezeTableName: true,
      underscored: true,
      timestamps: true
    }
  }
);

module.exports = sequelize; 