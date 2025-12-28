const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportsController');

// Transport management
router.get('/', transportController.getAllTransports);
router.get('/:transportId', transportController.getTransport);
router.post('/', transportController.createTransport);
router.put('/:transportId', transportController.updateTransport);
router.delete('/:transportId', transportController.deleteTransport);
router.get('/:transportId/chain-of-custody', transportController.getChainOfCustody);
router.post('/:transportId/start', transportController.startTransport);
router.post('/:transportId/complete', transportController.completeTransport);
router.post('/:transportId/arrive', transportController.confirmArrival);
router.get('/:transportId/status', transportController.getTransportStatus);

module.exports = router; 