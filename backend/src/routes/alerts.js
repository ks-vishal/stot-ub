const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

// Alert management
router.get('/', alertsController.getAlerts);
router.get('/:alertId', alertsController.getAlert);
router.post('/:alertId/resolve', alertsController.resolveAlert);
router.post('/clear', alertsController.clearAllAlerts);
router.get('/transport/:transportId', alertsController.getTransportAlerts);

module.exports = router; 