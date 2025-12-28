const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

router.post('/create', transportController.createTransport);
router.get('/track/:transportId', transportController.trackTransport);
router.post('/complete', transportController.completeTransport);
router.get('/:transportId/custody', transportController.getChainOfCustody);
router.post('/:transportId/arrive', transportController.confirmArrival);

module.exports = router; 