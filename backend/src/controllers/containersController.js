const db = require('../models');
const logger = require('../utils/logger');

exports.assignContainer = async (req, res) => {
  try {
    const { organId, transportId, containerId } = req.body;

    if (!organId || !transportId || !containerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if organ exists
    const organ = await db.Organ.findOne({ where: { organ_id: organId } });
    if (!organ) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    // Check if transport exists
    const transport = await db.Transport.findOne({ where: { transport_id: transportId } });
    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }

    // Update organ with container assignment
    await organ.update({
      assigned_uav_id: transport.uav_id,
      status: 'container_assigned'
    });

    // Log container assignment event
    await db.BlockchainTransaction.create({
      event_type: 'container_assigned',
      organ_id: organId,
      transport_id: transportId,
      uav_id: transport.uav_id,
      operator_address: '0x' + '0'.repeat(40), // Mock Ethereum address
      transaction_hash: '0x' + '0'.repeat(64), // Mock hash for now
      event_data: { containerId, organId, transportId }
    });

    logger.info(`Container ${containerId} assigned to organ ${organId} for transport ${transportId}`);

    res.status(200).json({
      message: 'Container assigned successfully',
      containerId,
      organId,
      transportId,
      status: 'assigned'
    });

  } catch (error) {
    logger.error('Container assignment failed:', error);
    console.error('Full error details:', error);
    res.status(500).json({ error: 'Failed to assign container' });
  }
};

exports.sealContainer = async (req, res) => {
  try {
    const { containerId } = req.params;
    const { organId, transportId, sealVerification } = req.body;

    if (!organId || !transportId || !sealVerification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify seal (this could include QR code scan, digital signature, etc.)
    if (!sealVerification.verified) {
      return res.status(400).json({ error: 'Container seal verification failed' });
    }

    // Update organ status
    const organ = await db.Organ.findOne({ where: { organ_id: organId } });
    if (!organ) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    await organ.update({
      status: 'sealed',
      current_temperature: sealVerification.temperature || null,
      current_humidity: sealVerification.humidity || null
    });

    // Log sealing event
    const transport = await db.Transport.findOne({ where: { transport_id: transportId } });
    await db.BlockchainTransaction.create({
      event_type: 'container_sealed',
      organ_id: organId,
      transport_id: transportId,
      uav_id: transport.uav_id,
      operator_address: '0x' + '0'.repeat(40), // Mock Ethereum address
      transaction_hash: '0x' + '0'.repeat(64), // Mock hash for now
      event_data: { 
        containerId, 
        organId, 
        transportId,
        sealVerification,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`Container ${containerId} sealed for organ ${organId}`);

    res.status(200).json({
      message: 'Container sealed successfully',
      containerId,
      organId,
      transportId,
      sealVerification,
      status: 'sealed'
    });

  } catch (error) {
    logger.error('Container sealing failed:', error.message);
    res.status(500).json({ error: 'Failed to seal container' });
  }
};

exports.unsealContainer = async (req, res) => {
  try {
    const { containerId } = req.params;
    const { organId, transportId, unsealVerification } = req.body;

    if (!organId || !transportId || !unsealVerification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify unsealing (this could include QR code scan, digital signature, etc.)
    if (!unsealVerification.verified) {
      return res.status(400).json({ error: 'Container unsealing verification failed' });
    }

    // Update organ status
    const organ = await db.Organ.findOne({ where: { organ_id: organId } });
    if (!organ) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    await organ.update({
      status: 'delivered',
      current_temperature: unsealVerification.temperature || null,
      current_humidity: unsealVerification.humidity || null
    });

    // Log unsealing event
    const transport = await db.Transport.findOne({ where: { transport_id: transportId } });
    await db.BlockchainTransaction.create({
      event_type: 'container_unsealed',
      organ_id: organId,
      transport_id: transportId,
      uav_id: transport.uav_id,
      operator_address: '0x' + '0'.repeat(40), // Mock Ethereum address
      transaction_hash: '0x' + '0'.repeat(64), // Mock hash for now
      event_data: { 
        containerId, 
        organId, 
        transportId,
        unsealVerification,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`Container ${containerId} unsealed for organ ${organId}`);

    res.status(200).json({
      message: 'Container unsealed successfully',
      containerId,
      organId,
      transportId,
      unsealVerification,
      status: 'unsealed'
    });

  } catch (error) {
    logger.error('Container unsealing failed:', error.message);
    res.status(500).json({ error: 'Failed to unseal container' });
  }
};

exports.getContainerStatus = async (req, res) => {
  try {
    const { containerId } = req.params;

    // Get container status and associated organ/transport info
    const blockchainEvents = await db.BlockchainTransaction.findAll({
      where: {
        event_type: ['container_assigned', 'container_sealed', 'container_unsealed'],
        event_data: { containerId }
      },
      order: [['created_at', 'ASC']]
    });

    res.json({
      containerId,
      events: blockchainEvents,
      currentStatus: blockchainEvents.length > 0 ? blockchainEvents[blockchainEvents.length - 1].event_type : 'unknown'
    });

  } catch (error) {
    logger.error('Get container status failed:', error.message);
    res.status(500).json({ error: 'Failed to get container status' });
  }
}; 