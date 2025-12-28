const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/audit', reportsController.getAuditTrail);
router.get('/history/:organId', reportsController.getOrganHistory);

module.exports = router; 