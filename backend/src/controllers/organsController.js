const db = require('../models');
const { registerOrgan } = require('../utils/blockchain');
const logger = require('../utils/logger');

exports.getAllOrgans = async (req, res) => {
  try {
    const organs = await db.Organ.findAll({
      attributes: ['id', 'organ_id', 'organ_type', 'blood_type', 'status', 'priority_level', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      organs: organs
    });
  } catch (error) {
    logger.error('Get all organs failed:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get organs' 
    });
  }
};

exports.confirmRetrieval = async (req, res) => {
  try {
    const {
      organId,
      organType,
      bloodType,
      donorId,
      recipientId,
      donorHospital,
      recipientHospital,
      donorLocationLat,
      donorLocationLng,
      recipientLocationLat,
      recipientLocationLng,
      priorityLevel,
      preservationTimeLimit
    } = req.body;

    // Validate required fields
    if (!organId || !organType || !bloodType || !donorId || !recipientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create organ record in database
    const organ = await db.Organ.create({
      organ_id: organId,
      organ_type: organType,
      blood_type: bloodType,
      donor_id: donorId,
      recipient_id: recipientId,
      donor_hospital: donorHospital,
      recipient_hospital: recipientHospital,
      donor_location_lat: donorLocationLat,
      donor_location_lng: donorLocationLng,
      recipient_location_lat: recipientLocationLat,
      recipient_location_lng: recipientLocationLng,
      priority_level: priorityLevel || 'medium',
      preservation_time_limit: preservationTimeLimit,
      status: 'pending'
    });

    // Register organ on blockchain
    try {
      const blockchainTx = await registerOrgan({
        organId,
        organType,
        donor: donorId,
        recipient: recipientId,
        location: `${donorLocationLat},${donorLocationLng}`,
        notes: `Organ retrieved from ${donorHospital}`
      });

      // Log blockchain event
      await db.BlockchainTransaction.create({
        event_type: 'organ_registered',
        organ_id: organId,
        operator_address: req.user.id,
        transaction_hash: blockchainTx.hash,
        event_data: { organType, donorId, recipientId }
      });

      logger.info(`Organ ${organId} registered on blockchain: ${blockchainTx.hash}`);
    } catch (blockchainError) {
      logger.error('Blockchain registration failed:', blockchainError.message);
      // Continue with database record even if blockchain fails
    }

    res.status(201).json({
      message: 'Organ retrieval confirmed',
      organ: {
        id: organ.id,
        organId: organ.organ_id,
        organType: organ.organ_type,
        status: organ.status,
        priorityLevel: organ.priority_level
      }
    });

  } catch (error) {
    logger.error('Organ retrieval confirmation failed:', error.message);
    res.status(500).json({ error: 'Failed to confirm organ retrieval' });
  }
};

exports.getOrgan = async (req, res) => {
  try {
    const { organId } = req.params;
    const organ = await db.Organ.findOne({ where: { organ_id: organId } });
    
    if (!organ) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    res.json({ organ });
  } catch (error) {
    logger.error('Get organ failed:', error.message);
    res.status(500).json({ error: 'Failed to get organ' });
  }
};

exports.updateOrgan = async (req, res) => {
  try {
    const { organId } = req.params;
    const updateData = req.body;
    
    const organ = await db.Organ.findOne({ where: { organ_id: organId } });
    if (!organ) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    await organ.update(updateData);
    res.json({ message: 'Organ updated successfully', organ });
  } catch (error) {
    logger.error('Update organ failed:', error.message);
    res.status(500).json({ error: 'Failed to update organ' });
  }
};

exports.getOrganStatus = async (req, res) => {
  try {
    const { organId } = req.params;
    const organ = await db.Organ.findOne({ 
      where: { organ_id: organId },
      include: [
        { model: db.Transport, as: 'transports' },
        { model: db.BlockchainTransaction, as: 'blockchain_events' }
      ]
    });
    
    if (!organ) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    res.json({ 
      organId: organ.organ_id,
      status: organ.status,
      currentLocation: {
        lat: organ.current_location_lat,
        lng: organ.current_location_lng
      },
      assignedUAV: organ.assigned_uav_id,
      transports: organ.transports,
      blockchainEvents: organ.blockchain_events
    });
  } catch (error) {
    logger.error('Get organ status failed:', error.message);
    res.status(500).json({ error: 'Failed to get organ status' });
  }
}; 