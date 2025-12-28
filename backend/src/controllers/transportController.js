const db = require('../models');
const { startTransport, completeTransport } = require('../utils/blockchain');
const logger = require('../utils/logger');

exports.createTransport = async (req, res) => {
  try {
    const {
      organId,
      uavId,
      startLocationLat,
      startLocationLng,
      estimatedDuration
    } = req.body;

    if (!organId || !uavId || !startLocationLat || !startLocationLng) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if organ exists and is available
    const organ = await db.Organ.findOne({ where: { organ_id: organId } });
    if (!organ) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    if (organ.status !== 'pending' && organ.status !== 'container_assigned') {
      return res.status(400).json({ error: 'Organ is not available for transport' });
    }

    // Check if UAV is available
    const uav = await db.UAV.findOne({ where: { uav_id: uavId } });
    if (!uav || uav.status !== 'available') {
      return res.status(400).json({ error: 'UAV is not available' });
    }

    // Generate transport ID
    const transportId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create transport record
    const transport = await db.Transport.create({
      transport_id: transportId,
      organ_id: organId,
      uav_id: uavId,
      operator_id: req.user.id,
      start_location_lat: startLocationLat,
      start_location_lng: startLocationLng,
      status: 'pending',
      estimated_duration: estimatedDuration,
      start_time: null, // Explicitly set to null at creation
      end_time: null // Explicitly set to null at creation
    });

    // Update organ status and location
    await organ.update({
      status: 'in_transit',
      assigned_uav_id: uavId,
      assigned_operator_id: req.user.id,
      current_location_lat: startLocationLat,
      current_location_lng: startLocationLng
    });

    // Update UAV status and location
    await uav.update({ status: 'in_use', current_location_lat: startLocationLat, current_location_lng: startLocationLng });

    // Set transport to in_transit and set start_time
    await transport.update({ status: 'in_transit', start_time: new Date() });

    // Start transport on blockchain
    try {
      const blockchainTx = await startTransport({
        transportId,
        organId,
        startLocation: `${startLocationLat},${startLocationLng}`,
        estimatedDuration
      });

      // Log blockchain event
      await db.BlockchainTransaction.create({
        event_type: 'transport_started',
        transport_id: transportId,
        organ_id: organId,
        uav_id: uavId,
        operator_address: req.user.id,
        transaction_hash: blockchainTx.hash,
        event_data: { startLocationLat, startLocationLng, estimatedDuration }
      });

      logger.info(`Transport ${transportId} started on blockchain: ${blockchainTx.hash}`);
    } catch (blockchainError) {
      logger.error('Blockchain transport start failed:', blockchainError.message);
    }

    res.status(201).json({
      message: 'Transport created successfully',
      transport: {
        id: transport.id,
        transportId: transport.transport_id,
        organId: transport.organ_id,
        uavId: transport.uav_id,
        status: transport.status,
        startLocation: {
          lat: transport.start_location_lat,
          lng: transport.start_location_lng
        }
      }
    });

  } catch (error) {
    logger.error('Create transport failed:', error.message);
    res.status(500).json({ error: 'Failed to create transport' });
  }
};

exports.trackTransport = async (req, res) => {
  try {
    const { transportId } = req.params;

    const transport = await db.Transport.findOne({
      where: { transport_id: transportId }
    });

    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }

    // Get organ details separately
    const organ = await db.Organ.findOne({
      where: { organ_id: transport.organ_id }
    });

    // Get UAV details separately
    const uav = await db.UAV.findOne({
      where: { uav_id: transport.uav_id }
    });

    // Get latest sensor reading separately
    const latestSensorReading = await db.SensorReading.findOne({
      where: { transport_id: transportId },
      order: [['created_at', 'DESC']]
    });

    res.json({
      transportId: transport.transport_id,
      status: transport.status,
      organ: organ,
      uav: uav,
      currentLocation: {
        lat: transport.end_location_lat || transport.start_location_lat,
        lng: transport.end_location_lng || transport.start_location_lng
      },
      latestSensorData: latestSensorReading,
      startTime: transport.start_time,
      estimatedDuration: transport.estimated_duration,
      actualDuration: transport.actual_duration
    });

  } catch (error) {
    logger.error('Track transport failed:', error);
    console.error('Track transport error details:', error);
    res.status(500).json({ error: 'Failed to track transport' });
  }
};

exports.completeTransport = async (req, res) => {
  try {
    const { transportId, endLocationLat, endLocationLng, finalStatus, distanceCovered, averageSpeed } = req.body;

    const transport = await db.Transport.findOne({ where: { transport_id: transportId } });
    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }

    if (transport.status === 'completed') {
      return res.status(400).json({ error: 'Transport already completed' });
    }

    // Update transport
    await transport.update({
      status: 'completed',
      end_time: new Date(),
      end_location_lat: endLocationLat,
      end_location_lng: endLocationLng,
      actual_duration: Math.round((Date.now() - new Date(transport.start_time).getTime()) / (1000 * 60)),
      distance_covered: distanceCovered,
      average_speed: averageSpeed
    });

    // Update organ status and location
    const organ = await db.Organ.findOne({ where: { organ_id: transport.organ_id } });
    if (organ) {
      await organ.update({
        status: 'delivered',
        current_location_lat: endLocationLat,
        current_location_lng: endLocationLng
      });
    }

    // Update UAV status and location
    const uav = await db.UAV.findOne({ where: { uav_id: transport.uav_id } });
    if (uav) {
      await uav.update({ status: 'available', current_location_lat: endLocationLat, current_location_lng: endLocationLng });
    }

    // Complete transport on blockchain
    try {
      const blockchainTx = await completeTransport({
        transportId,
        endLocation: `${endLocationLat},${endLocationLng}`,
        finalStatus,
        distanceCovered,
        averageSpeed
      });

      // Log blockchain event
      await db.BlockchainTransaction.create({
        event_type: 'transport_completed',
        transport_id: transportId,
        organ_id: transport.organ_id,
        uav_id: transport.uav_id,
        operator_address: req.user.id,
        transaction_hash: blockchainTx.hash,
        event_data: { endLocationLat, endLocationLng, finalStatus, distanceCovered, averageSpeed }
      });

      logger.info(`Transport ${transportId} completed on blockchain: ${blockchainTx.hash}`);
    } catch (blockchainError) {
      logger.error('Blockchain transport completion failed:', blockchainError.message);
    }

    // Add audit log for completion
    await db.AuditLog.create({
      user_id: req.user.id,
      action: 'COMPLETE_TRANSPORT',
      table_name: 'transports',
      record_id: transport.transport_id,
      new_values: transport.toJSON(),
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({
      message: 'Transport completed successfully',
      transport: {
        id: transport.id,
        transportId: transport.transport_id,
        status: transport.status,
        endTime: transport.end_time,
        actualDuration: transport.actual_duration
      }
    });

  } catch (error) {
    logger.error('Complete transport failed:', error.message);
    res.status(500).json({ error: 'Failed to complete transport' });
  }
};

exports.getChainOfCustody = async (req, res) => {
  try {
    const { transportId } = req.params;

    // Get all blockchain events for this transport
    const blockchainEvents = await db.BlockchainTransaction.findAll({
      where: { transport_id: transportId },
      order: [['created_at', 'ASC']],
      include: [
        { model: db.Organ, as: 'organ' },
        { model: db.UAV, as: 'uav' }
      ]
    });

    // Get transport details
    const transport = await db.Transport.findOne({
      where: { transport_id: transportId },
      include: [
        { model: db.Organ, as: 'organ' },
        { model: db.UAV, as: 'uav' }
      ]
    });

    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }

    // Format custody timeline
    const custodyTimeline = blockchainEvents.map(event => ({
      id: event.id,
      eventType: event.event_type,
      timestamp: event.created_at,
      transactionHash: event.transaction_hash,
      operatorAddress: event.operator_address,
      eventData: event.event_data,
      status: event.status
    }));

    res.json({
      transportId,
      organ: transport.organ,
      uav: transport.uav,
      custodyTimeline,
      totalEvents: custodyTimeline.length
    });

  } catch (error) {
    logger.error('Get chain of custody failed:', error.message);
    res.status(500).json({ error: 'Failed to get chain of custody' });
  }
};

exports.confirmArrival = async (req, res) => {
  try {
    const { transportId } = req.params;
    const { arrivalLocationLat, arrivalLocationLng, arrivalNotes } = req.body;

    const transport = await db.Transport.findOne({ where: { transport_id: transportId } });
    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }

    if (transport.status === 'completed') {
      return res.status(400).json({ error: 'Transport already completed' });
    }

    // Update transport with arrival details
    await transport.update({
      status: 'arrived',
      end_location_lat: arrivalLocationLat,
      end_location_lng: arrivalLocationLng
    });

    // Log arrival event
    await db.BlockchainTransaction.create({
      event_type: 'transport_arrived',
      transport_id: transportId,
      organ_id: transport.organ_id,
      uav_id: transport.uav_id,
      operator_address: req.user.id,
      transaction_hash: '0x' + '0'.repeat(64), // Mock hash for now
      event_data: { 
        arrivalLocationLat, 
        arrivalLocationLng, 
        arrivalNotes,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`Transport ${transportId} arrived at destination`);

    res.json({
      message: 'Arrival confirmed successfully',
      transportId,
      arrivalLocation: {
        lat: arrivalLocationLat,
        lng: arrivalLocationLng
      },
      status: 'arrived'
    });

  } catch (error) {
    logger.error('Confirm arrival failed:', error.message);
    res.status(500).json({ error: 'Failed to confirm arrival' });
  }
}; 