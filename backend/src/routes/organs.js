const express = require('express');
const router = express.Router();
const organsController = require('../controllers/organsController');

// Organ retrieval and management
router.get('/', organsController.getAllOrgans);
router.post('/retrieve', organsController.confirmRetrieval);
router.get('/:organId', organsController.getOrgan);
router.put('/:organId', organsController.updateOrgan);
router.get('/:organId/status', organsController.getOrganStatus);

module.exports = router; 