const db = require('../models');
const logger = require('../utils/logger');

exports.getAlerts = async (req, res) => {
  try {
    const { severity, alertType, isResolved, limit = 50 } = req.query;

    const whereClause = {};
    if (severity) whereClause.severity = severity;
    if (alertType) whereClause.alert_type = alertType;
    if (isResolved !== undefined) whereClause.is_resolved = isResolved === 'true';

    // Test if Alert model exists
    if (!db.Alert) {
      logger.error('Alert model not found in db object');
      return res.status(500).json({ error: 'Alert model not available' });
    }

    const alerts = await db.Alert.findAll({
      where: whereClause,
      include: [
        { model: db.Transport, as: 'transport' },
        { model: db.Organ, as: 'organ' },
        { model: db.UAV, as: 'uav' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      alerts,
      total: alerts.length
    });

  } catch (error) {
    logger.error('Get alerts failed:', error.message);
    logger.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to get alerts', details: error.message });
  }
};

exports.getAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await db.Alert.findByPk(alertId, {
      include: [
        { model: db.Transport, as: 'transport' },
        { model: db.Organ, as: 'organ' },
        { model: db.UAV, as: 'uav' }
      ]
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ alert });

  } catch (error) {
    logger.error('Get alert failed:', error.message);
    res.status(500).json({ error: 'Failed to get alert' });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolutionNotes } = req.body;

    const alert = await db.Alert.findByPk(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.is_resolved) {
      return res.status(400).json({ error: 'Alert already resolved' });
    }

    // Update alert
    await alert.update({
      is_resolved: true,
      resolved_by: req.user.id,
      resolved_at: new Date()
    });

    // Log resolution event
    await db.BlockchainTransaction.create({
      event_type: 'alert_resolved',
      transport_id: alert.transport_id,
      organ_id: alert.organ_id,
      uav_id: alert.uav_id,
      operator_address: req.user.id,
      transaction_hash: '0x' + '0'.repeat(64), // Mock hash for now
      event_data: { 
        alertId, 
        alertType: alert.alert_type,
        severity: alert.severity,
        resolutionNotes,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`Alert ${alertId} resolved by user ${req.user.id}`);

    res.json({
      message: 'Alert resolved successfully',
      alert: {
        id: alert.id,
        alertType: alert.alert_type,
        severity: alert.severity,
        isResolved: alert.is_resolved,
        resolvedAt: alert.resolved_at
      }
    });

  } catch (error) {
    logger.error('Resolve alert failed:', error.message);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
};

exports.getTransportAlerts = async (req, res) => {
  try {
    const { transportId } = req.params;
    const { isResolved } = req.query;

    const whereClause = { transport_id: transportId };
    if (isResolved !== undefined) whereClause.is_resolved = isResolved === 'true';

    const alerts = await db.Alert.findAll({
      where: whereClause,
      include: [
        { model: db.Transport, as: 'transport' },
        { model: db.Organ, as: 'organ' },
        { model: db.UAV, as: 'uav' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      transportId,
      alerts,
      total: alerts.length,
      activeAlerts: alerts.filter(alert => !alert.is_resolved).length
    });

  } catch (error) {
    logger.error('Get transport alerts failed:', error.message);
    res.status(500).json({ error: 'Failed to get transport alerts' });
  }
};

exports.clearAllAlerts = async (req, res) => {
  try {
    const { transportId } = req.query;

    const whereClause = { is_resolved: false };
    if (transportId) whereClause.transport_id = transportId;

    const result = await db.Alert.update(
      {
        is_resolved: true,
        resolved_by: req.user.id,
        resolved_at: new Date()
      },
      {
        where: whereClause
      }
    );

    logger.info(`Cleared ${result[0]} alerts by user ${req.user.id}`);

    res.json({
      success: true,
      message: `Cleared ${result[0]} alerts successfully`,
      clearedCount: result[0]
    });

  } catch (error) {
    logger.error('Clear all alerts failed:', error.message);
    res.status(500).json({ error: 'Failed to clear alerts' });
  }
}; 