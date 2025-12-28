const db = require('../models');

exports.getAuditTrail = async (req, res) => {
  try {
    const logs = await db.AuditLog.findAll({ order: [['created_at', 'DESC']], limit: 100 });
    res.json({ logs });
  } catch (err) {
    console.error('Get audit trail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrganHistory = async (req, res) => {
  try {
    const { organId } = req.params;
    const logs = await db.AuditLog.findAll({ where: { record_id: organId }, order: [['created_at', 'DESC']] });
    res.json({ logs });
  } catch (err) {
    console.error('Get organ history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 