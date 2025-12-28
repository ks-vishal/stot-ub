const express = require('express');
const router = express.Router();
const containersController = require('../controllers/containersController');

// Container management
router.post('/assign', containersController.assignContainer);
router.post('/:containerId/seal', containersController.sealContainer);
router.post('/:containerId/unseal', containersController.unsealContainer);
router.get('/:containerId/status', containersController.getContainerStatus);

module.exports = router; 