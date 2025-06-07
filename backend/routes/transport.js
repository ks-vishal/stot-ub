const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const blockchainService = require('../blockchain/BlockchainService');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, requireRole } = require('../middleware/auth');
const TransportContract = require('../blockchain/TransportContract');
const MQTTService = require('../mqtt/mqttService');

// Middleware to validate transportId parameter
const validateTransportId = [
    check('transportId').isNumeric().withMessage('Transport ID must be numeric')
];

/**
 * @route   POST api/transport/initiate
 * @desc    Initiate a new organ transport
 * @access  Private (Hospital Role)
 */
router.post('/initiate',
    [verifyToken, requireRole(['hospital'])],
    async (req, res) => {
        try {
            const { organID, sourceHospital, destinationHospital } = req.body;
            const transportID = uuidv4();
            const db = req.app.get('db');

            // Store in SQLite
            db.run(
                'INSERT INTO transports (transportID, organID, sourceHospital, destinationHospital, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
                [transportID, organID, sourceHospital, destinationHospital, 'initiated', new Date().toISOString()],
                async (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Database error' });
                    }

                    try {
                        // Record on blockchain
                        await TransportContract.initiateTransport(
                            transportID,
                            organID,
                            sourceHospital,
                            destinationHospital
                        );

                        res.json({
                            success: true,
                            message: 'Transport initiated successfully',
                            transportID
                        });
                    } catch (error) {
                        console.error('Blockchain error:', error);
                        res.status(500).json({
                            success: false,
                            message: 'Blockchain error'
                        });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

/**
 * @route   POST api/transport/:transportId/status
 * @desc    Update transport status
 * @access  Private (Transport Role)
 */
router.post('/:transportId/status', [
    ...validateTransportId,
    check('status').notEmpty().withMessage('Status is required'),
    check('privateKey').notEmpty().withMessage('Transporter private key is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { transportId } = req.params;
        const { status, privateKey } = req.body;

        const result = await blockchainService.updateTransportStatus(
            privateKey,
            transportId,
            status
        );

        res.json(result);
    } catch (error) {
        console.error('Error updating transport status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET api/transport/:transportId
 * @desc    Get transport status
 * @access  Public
 */
router.get('/:transportId', validateTransportId, async (req, res) => {
    try {
        const { transportId } = req.params;
        const status = await blockchainService.getTransportStatus(transportId);
        res.json(status);
    } catch (error) {
        console.error('Error getting transport status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET api/transport/:organID
 * @desc    Get transport history for an organ
 * @access  Private
 */
router.get('/:organID',
    [verifyToken],
    async (req, res) => {
        try {
            const history = await TransportContract.getTransportHistory(req.params.organID);
            res.json({ history });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Error fetching transport history'
            });
        }
    }
);

/**
 * @route   GET api/sensors/:organID
 * @desc    Get sensor data for an organ
 * @access  Private
 */
router.get('/sensors/:organID',
    [verifyToken],
    (req, res) => {
        const mqttService = req.app.get('mqttService');
        const sensorData = mqttService.getSensorData(req.params.organID);

        if (!sensorData) {
            return res.status(404).json({
                success: false,
                message: 'No sensor data found for this organ'
            });
        }

        res.json(sensorData);
    }
);

/**
 * @route   GET api/uav/:flightID
 * @desc    Get UAV data for a flight
 * @access  Private
 */
router.get('/uav/:flightID',
    [verifyToken],
    (req, res) => {
        const mqttService = req.app.get('mqttService');
        const uavData = mqttService.getUAVData(req.params.flightID);

        if (!uavData) {
            return res.status(404).json({
                success: false,
                message: 'No UAV data found for this flight'
            });
        }

        res.json(uavData);
    }
);

/**
 * @route   POST api/transport/verify
 * @desc    Verify organ delivery
 * @access  Private (Hospital Role)
 */
router.post('/verify',
    [verifyToken, requireRole(['hospital'])],
    async (req, res) => {
        try {
            const { organID, transportID } = req.body;
            const db = req.app.get('db');

            // Update SQLite status
            db.run(
                'UPDATE transports SET status = ? WHERE transportID = ?',
                ['delivered', transportID],
                async (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Database error'
                        });
                    }

                    try {
                        // Confirm delivery on blockchain
                        await TransportContract.confirmDelivery(transportID);

                        res.json({
                            success: true,
                            message: 'Delivery verified successfully'
                        });
                    } catch (error) {
                        console.error('Blockchain error:', error);
                        res.status(500).json({
                            success: false,
                            message: 'Blockchain error'
                        });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

module.exports = router; 