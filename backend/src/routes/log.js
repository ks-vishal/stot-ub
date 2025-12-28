const express = require('express');
const router = express.Router();

router.post('/frontend-error', (req, res) => {
  console.error('[FRONTEND ERROR]', req.body);
  res.status(200).json({ status: 'logged' });
});

module.exports = router; 