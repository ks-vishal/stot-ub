const express = require('express');
const router = express.Router();
const blockchainEventsController = require('../controllers/blockchainEventsController');

// Blockchain events management
router.get('/', blockchainEventsController.getAllEvents);
router.get('/:eventId', blockchainEventsController.getEvent);
router.get('/transport/:transportId', blockchainEventsController.getTransportEvents);
router.get('/organ/:organId', blockchainEventsController.getOrganEvents);

module.exports = router; 