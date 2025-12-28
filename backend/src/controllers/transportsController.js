const { Transport, Organ, UAV, BlockchainTransaction, AuditLog, User } = require('../models');
const logger = require('../utils/logger');
const { createTransportEvent, logBlockchainEvent } = require('../utils/blockchain');

const transportController = {
  // Get all transports
  getAllTransports: async (req, res) => {
    try {
      const transports = await Transport.findAll({
        include: [
          { model: Organ, as: 'organ', attributes: ['organ_id', 'organ_type', 'blood_type'] },
          { model: UAV, as: 'uav', attributes: ['uav_id', 'model', 'status'] }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        transports: transports
      });
    } catch (error) {
      logger.error('Error fetching transports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transports',
        error: error.message
      });
    }
  },

  // Get specific transport
  getTransport: async (req, res) => {
    try {
      const { transportId } = req.params;
      const transport = await Transport.findOne({
        where: { transport_id: transportId },
        include: [
          { model: Organ, as: 'organ' },
          { model: UAV, as: 'uav' },
          { model: BlockchainTransaction, as: 'blockchain_transactions' }
        ]
      });
      
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }
      
      res.json({
        success: true,
        transport: transport
      });
    } catch (error) {
      logger.error('Error fetching transport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transport',
        error: error.message
      });
    }
  },

  // Create new transport
  createTransport: async (req, res) => {
    try {
      const {
        organ_id,
        uav_id,
        route_notes,
        special_instructions
      } = req.body;
      
      if (!organ_id || !uav_id || !route_notes || !special_instructions) {
        return res.status(400).json({
          success: false,
          message: 'Organ ID, UAV ID, route notes, and special instructions are required'
        });
      }
      
      // Check if organ exists
      const organ = await Organ.findOne({ where: { organ_id } });
      if (!organ) {
        return res.status(404).json({
          success: false,
          message: 'Organ not found'
        });
      }
      
      // Find UAV by ID (frontend sends database ID, but we need uav_id string)
      const uav = await UAV.findByPk(uav_id);
      if (!uav) {
        return res.status(404).json({
          success: false,
          message: 'UAV not found'
        });
      }
      
      if (uav.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'UAV is not available'
        });
      }
      // Calculate distance (Haversine formula)
      function toRad(x) { return x * Math.PI / 180; }
      const R = 6371; // km
      const lat1 = parseFloat(organ.donor_location_lat);
      const lng1 = parseFloat(organ.donor_location_lng);
      const lat2 = parseFloat(organ.recipient_location_lat);
      const lng2 = parseFloat(organ.recipient_location_lng);
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = R * c;
      // Priority factor
      const priorityMap = { urgent: 3, high: 2, medium: 1.5, low: 1 };
      const priorityLevel = organ.priority_level || 'medium';
      const priorityFactor = priorityMap[priorityLevel] || 1.5;
      // Assume UAV speed 60 km/h
      const speedKmh = 60;
      let baseDuration = distanceKm / speedKmh * 60; // in minutes
      // Inverse proportional to priority
      let estimated_duration = Math.ceil(baseDuration / priorityFactor);
      // Generate transport ID
      const transport_id = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transport = await Transport.create({
        transport_id,
        organ_id,
        uav_id: uav.uav_id, // Use the uav_id string from the UAV record
        operator_id: req.user.id,
        estimated_duration,
        start_location_lat: organ.donor_location_lat,
        start_location_lng: organ.donor_location_lng,
        end_location_lat: organ.recipient_location_lat,
        end_location_lng: organ.recipient_location_lng,
        status: 'pending',
        route_notes,
        special_instructions
      });
      // Log blockchain event: transport_created
      await BlockchainTransaction.create({
        event_type: 'transport_created',
        transport_id: transport.transport_id,
        organ_id: organ_id,
        uav_id: uav.uav_id,
        operator_address: req.user.id,
        transaction_hash: '', // Fill with actual tx hash if available
        event_data: { estimated_duration, priority: priorityLevel, route_notes, special_instructions }
      });
      // Update organ and UAV status
      await organ.update({ status: 'in_transit', assigned_uav_id: uav.uav_id, assigned_operator_id: req.user.id });
      await uav.update({ status: 'in_use' });
      // Log audit entry
      await AuditLog.create({
        user_id: req.user.id,
        action: 'CREATE_TRANSPORT',
        table_name: 'transports',
        record_id: transport.transport_id,
        new_values: transport.toJSON(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      logger.info(`Transport created: ${transport.transport_id} for organ ${organ_id}`);
      res.status(201).json({
        success: true,
        message: 'Transport created successfully',
        transport: {
          id: transport.id,
          transport_id: transport.transport_id,
          organ_id: transport.organ_id,
          uav_id: transport.uav_id,
          status: transport.status,
          estimated_duration: transport.estimated_duration
        }
      });
    } catch (error) {
      logger.error('Error creating transport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create transport',
        error: error.message
      });
    }
  },

  // Update transport
  updateTransport: async (req, res) => {
    try {
      const { transportId } = req.params;
      const updateData = req.body;
      
      const transport = await Transport.findByPk(transportId);
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }
      
      await transport.update(updateData);
      
      logger.info(`Transport updated: ${transportId}`);
      
      res.json({
        success: true,
        message: 'Transport updated successfully',
        transport: transport
      });
    } catch (error) {
      logger.error('Error updating transport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transport',
        error: error.message
      });
    }
  },

  // Delete transport
  deleteTransport: async (req, res) => {
    try {
      const { transportId } = req.params;
      
      const transport = await Transport.findByPk(transportId);
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }
      
      // Only allow deletion of pending transports
      if (transport.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete transport that is not in pending status'
        });
      }
      
      await transport.destroy();
      
      logger.info(`Transport deleted: ${transportId}`);
      
      res.json({
        success: true,
        message: 'Transport deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting transport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete transport',
        error: error.message
      });
    }
  },

  // Get chain of custody
  getChainOfCustody: async (req, res) => {
    try {
      const { transportId } = req.params;
      
      const events = await BlockchainTransaction.findAll({
        where: { transport_id: transportId },
        order: [['timestamp', 'ASC']]
      });
      
      res.json({
        success: true,
        events: events
      });
    } catch (error) {
      logger.error('Error fetching chain of custody:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chain of custody',
        error: error.message
      });
    }
  },

  // Start transport
  startTransport: async (req, res) => {
    try {
      const { transportId } = req.params;
      
      const transport = await Transport.findByPk(transportId);
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }
      
      if (transport.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Transport is not in pending status'
        });
      }
      
      await transport.update({ status: 'in_transit', started_at: new Date() });
      // Set UAV status to in_use
      const uav = await UAV.findOne({ where: { uav_id: transport.uav_id } });
      if (uav) {
        await uav.update({ status: 'in_use' });
      }
      
      // Log blockchain event
      await BlockchainTransaction.create({
        event_type: 'transport_started',
        transport_id: transport.transport_id,
        organ_id: transport.organ_id,
        uav_id: transport.uav_id,
        operator_address: req.user.id,
        transaction_hash: '', // Fill with actual tx hash if available
        event_data: { started_at: new Date() }
      });
      
      // Log audit entry
      await AuditLog.create({
        user_id: req.user.id,
        action: 'START_TRANSPORT',
        table_name: 'transports',
        record_id: transport.transport_id,
        new_values: transport.toJSON(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      logger.info(`Transport started: ${transportId}`);
      
      res.json({
        success: true,
        message: 'Transport started successfully',
        transport: transport
      });
    } catch (error) {
      logger.error('Error starting transport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start transport',
        error: error.message
      });
    }
  },

  // Complete transport
  completeTransport: async (req, res) => {
    try {
      const { transportId } = req.params;
      const { endLocationLat, endLocationLng, finalStatus, distanceCovered, averageSpeed } = req.body;
      const transport = await Transport.findOne({ where: { transport_id: transportId } });
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }
      if (transport.status !== 'in_transit') {
        return res.status(400).json({
          success: false,
          message: 'Transport is not in transit'
        });
      }
      // Calculate actual duration
      const endTime = new Date();
      const actualDuration = transport.start_time ? Math.round((endTime - new Date(transport.start_time)) / (1000 * 60)) : null;
      await transport.update({
        status: 'completed',
        end_time: endTime,
        end_location_lat: endLocationLat,
        end_location_lng: endLocationLng,
        actual_duration: actualDuration,
        distance_covered: distanceCovered,
        average_speed: averageSpeed
      });
      // Update organ status and location
      await Organ.update(
        { status: 'delivered', current_location_lat: endLocationLat, current_location_lng: endLocationLng },
        { where: { organ_id: transport.organ_id } }
      );
      // Update UAV status and location
      await UAV.update(
        { status: 'available', current_location_lat: null, current_location_lng: null },
        { where: { uav_id: transport.uav_id } }
      );
      // Log blockchain event
      await BlockchainTransaction.create({
        event_type: 'transport_completed',
        transport_id: transport.transport_id,
        organ_id: transport.organ_id,
        uav_id: transport.uav_id,
        operator_address: req.user.id,
        transaction_hash: '', // Fill with actual tx hash if available
        event_data: { endLocationLat, endLocationLng, finalStatus, distanceCovered, averageSpeed, completed_at: endTime }
      });
      // Log audit entry
      await AuditLog.create({
        user_id: req.user.id,
        action: 'COMPLETE_TRANSPORT',
        table_name: 'transports',
        record_id: transport.transport_id,
        new_values: transport.toJSON(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      logger.info(`Transport completed: ${transportId}`);
      res.json({
        success: true,
        message: 'Transport completed successfully',
        transport: transport
      });
    } catch (error) {
      logger.error('Error completing transport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete transport',
        error: error.message
      });
    }
  },

  // Confirm arrival
  confirmArrival: async (req, res) => {
    try {
      const { transportId } = req.params;
      
      const transport = await Transport.findByPk(transportId);
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }
      
      await transport.update({ 
        status: 'arrived',
        arrival_confirmed_at: new Date()
      });
      
      // Log blockchain event
      await BlockchainTransaction.create({
        event_type: 'transport_arrived',
        transport_id: transport.transport_id,
        organ_id: transport.organ_id,
        uav_id: transport.uav_id,
        operator_address: req.user.id,
        transaction_hash: '', // Fill with actual tx hash if available
        event_data: { arrival_confirmed_at: new Date() }
      });
      
      // Log audit entry
      await AuditLog.create({
        user_id: req.user.id,
        action: 'CONFIRM_ARRIVAL',
        table_name: 'transports',
        record_id: transport.transport_id,
        new_values: transport.toJSON(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      logger.info(`Arrival confirmed for transport: ${transportId}`);
      
      res.json({
        success: true,
        message: 'Arrival confirmed successfully',
        transport: transport
      });
    } catch (error) {
      logger.error('Error confirming arrival:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm arrival',
        error: error.message
      });
    }
  },

  // Get transport status
  getTransportStatus: async (req, res) => {
    try {
      const { transportId } = req.params;
      
      const transport = await Transport.findByPk(transportId, {
        include: [
          { model: Organ, as: 'organ', attributes: ['organ_id', 'organ_type', 'status'] },
          { model: UAV, as: 'uav', attributes: ['uav_id', 'model', 'status'] }
        ]
      });
      
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }
      
      res.json({
        success: true,
        status: {
          id: transport.id,
          status: transport.status,
          organ: transport.organ,
          uav: transport.uav,
          estimated_duration: transport.estimated_duration,
          started_at: transport.started_at,
          completed_at: transport.completed_at,
          last_updated: transport.updated_at
        }
      });
    } catch (error) {
      logger.error('Error fetching transport status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transport status',
        error: error.message
      });
    }
  }
};

module.exports = transportController; 