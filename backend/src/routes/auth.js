const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/verify', authController.verifyRole);
router.get('/debug', authController.debug);

module.exports = router; 