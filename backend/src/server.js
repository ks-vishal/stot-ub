const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');
const database = require('./database/connection');
const authRoutes = require('./routes/auth');
const transportRoutes = require('./routes/transport');
const transportsRoutes = require('./routes/transports');
const sensorsRoutes = require('./routes/sensors');
const blockchainRoutes = require('./routes/blockchain');
const blockchainEventsRoutes = require('./routes/blockchainEvents');
const reportsRoutes = require('./routes/reports');
const organsRoutes = require('./routes/organs');
const containersRoutes = require('./routes/containers');
const alertsRoutes = require('./routes/alerts');
const uavsRoutes = require('./routes/uavs');
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');
const { client: mqttClient, setSocketIO, emitter } = require('./mqttClient');
const { checkThresholds, getThresholds } = require('./utils/thresholds');
const logRoutes = require('./routes/log');
const db = require('./models'); // Import Sequelize models

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
  }
});

const PORT = process.env.BACKEND_PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transport', authenticateToken, transportRoutes);
app.use('/api/transports', authenticateToken, transportsRoutes);
app.use('/api/sensors', authenticateToken, sensorsRoutes);
app.use('/api/blockchain', authenticateToken, blockchainRoutes);
app.use('/api/blockchain-events', authenticateToken, blockchainEventsRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/organs', authenticateToken, organsRoutes);
app.use('/api/containers', authenticateToken, containersRoutes);
app.use('/api/alerts', authenticateToken, alertsRoutes);
app.use('/api/uavs', authenticateToken, uavsRoutes);
app.use('/api/log', logRoutes);

// WebSocket for real-time sensor data and alerts
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('subscribe-transport', (transportId) => {
    socket.join(`transport-${transportId}`);
    logger.info(`Client ${socket.id} subscribed to transport: ${transportId}`);
    // Start MQTT simulation for this transport
    if (mqttClient.startSimulation) {
      mqttClient.startSimulation(transportId);
    }
  });

  emitter.on('sensorData', async (transportId, data) => {
    // Check for threshold violations
    const thresholds = await getThresholds(transportId);
    const alerts = checkThresholds(data, thresholds);
    io.to(`transport-${transportId}`).emit('sensorData', data);
    if (alerts) {
      // Persist each alert to the database if not already present
      for (const alertType of alerts) {
        // Check for existing alert for this transport, UAV, type, and timestamp
        const existing = await db.Alert.findOne({
          where: {
            transport_id: transportId,
            uav_id: data.uav_id,
            alert_type: alertType.toLowerCase().replace(/^low_|^high_/, ''),
            created_at: data.timestamp ? new Date(data.timestamp) : new Date(),
          }
        });
        if (!existing) {
          await db.Alert.create({
            alert_type: alertType.toLowerCase().replace(/^low_|^high_/, ''),
            severity: 'high', // You may want to map this based on alertType
            transport_id: transportId,
            uav_id: data.uav_id,
            organ_id: data.organ_id,
            message: `${alertType.replace('_', ' ')} detected`,
            sensor_data: data,
            created_at: data.timestamp ? new Date(data.timestamp) : new Date(),
          });
        }
      }
      io.to(`transport-${transportId}`).emit('alert', { alerts, data });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes 
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await database.ping();
    logger.info('Database connection established');
    // Start server
    server.listen(PORT, () => {
      logger.info(`STOT-UB Backend Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

setSocketIO(io);
startServer();