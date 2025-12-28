const express = require('express');
const router = express.Router();
const uavController = require('../controllers/uavController');

// UAV management
router.get('/', uavController.getAllUavs);
router.get('/:uavId', uavController.getUav);
router.post('/', uavController.createUav);
router.put('/:uavId', uavController.updateUav);
router.delete('/:uavId', uavController.deleteUav);
router.get('/:uavId/status', uavController.getUavStatus);

module.exports = router; 