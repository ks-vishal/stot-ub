const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, 'iot/logs/error.log'),
            level: 'error'
        }),
        new winston.transports.Console()
    ]
});

// Initialize MQTT Service
const MQTTService = require('./mqtt/mqttService');
const mqttService = new MQTTService(io);
mqttService.connect();

// Initialize Database
const initDatabase = require('./config/database');
const db = initDatabase();
app.set('db', db);
app.set('mqttService', mqttService);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/organs', require('./routes/organs'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/uav', require('./routes/uav'));

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('New client connected');

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
}); 