const express = require('express');
const router = express.Router();
const sensorsController = require('../controllers/sensorsController');

router.get('/realtime/:transportId', sensorsController.getRealtimeData);
router.get('/alerts/:transportId', sensorsController.getAlerts);
router.get('/history/:transportId', sensorsController.getSensorHistory);

module.exports = router; 