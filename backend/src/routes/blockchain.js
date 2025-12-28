const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

router.post('/register-organ', blockchainController.registerOrgan);
router.post('/start-transport', blockchainController.startTransport);
router.post('/update-transport', blockchainController.updateTransport);
router.post('/complete-transport', blockchainController.completeTransport);
router.get('/organ/:organId', blockchainController.getOrgan);
router.get('/transport/:transportId', blockchainController.getTransport);

module.exports = router; 