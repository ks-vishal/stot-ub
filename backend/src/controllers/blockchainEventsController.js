const { BlockchainTransaction } = require('../models');
const logger = require('../utils/logger');

const blockchainEventsController = {
  // Get all blockchain events
  getAllEvents: async (req, res) => {
    try {
      const { event_type, limit = 100, offset = 0 } = req.query;
      
      const whereClause = {};
      if (event_type) whereClause.event_type = event_type;
      
      const events = await BlockchainTransaction.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        events: events,
        total: events.length
      });
    } catch (error) {
      logger.error('Error fetching blockchain events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blockchain events',
        error: error.message
      });
    }
  },

  // Get specific blockchain event
  getEvent: async (req, res) => {
    try {
      const { eventId } = req.params;
      
      const event = await BlockchainTransaction.findByPk(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Blockchain event not found'
        });
      }
      
      res.json({
        success: true,
        event: event
      });
    } catch (error) {
      logger.error('Error fetching blockchain event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blockchain event',
        error: error.message
      });
    }
  },

  // Get transport-specific blockchain events
  getTransportEvents: async (req, res) => {
    try {
      const { transportId } = req.params;
      const { event_type, limit = 50 } = req.query;
      
      const whereClause = { transport_id: transportId };
      if (event_type) whereClause.event_type = event_type;
      
      const events = await BlockchainTransaction.findAll({
        where: whereClause,
        order: [['created_at', 'ASC']],
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        transport_id: transportId,
        events: events,
        total: events.length
      });
    } catch (error) {
      logger.error('Error fetching transport blockchain events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transport blockchain events',
        error: error.message
      });
    }
  },

  // Get organ-specific blockchain events
  getOrganEvents: async (req, res) => {
    try {
      const { organId } = req.params;
      const { event_type, limit = 50 } = req.query;
      
      const whereClause = { organ_id: organId };
      if (event_type) whereClause.event_type = event_type;
      
      const events = await BlockchainTransaction.findAll({
        where: whereClause,
        order: [['created_at', 'ASC']],
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        organ_id: organId,
        events: events,
        total: events.length
      });
    } catch (error) {
      logger.error('Error fetching organ blockchain events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch organ blockchain events',
        error: error.message
      });
    }
  }
};

module.exports = blockchainEventsController; 