const { UAV } = require('../models');
const logger = require('../utils/logger');

const uavController = {
  // Get all UAVs
  getAllUavs: async (req, res) => {
    try {
      const uavs = await UAV.findAll({
        attributes: ['id', 'uav_id', 'model', 'manufacturer', 'status', 'current_battery', 'current_location_lat', 'current_location_lng', 'created_at']
      });
      
      res.json({
        success: true,
        uavs: uavs
      });
    } catch (error) {
      logger.error('Error fetching UAVs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch UAVs',
        error: error.message
      });
    }
  },

  // Get specific UAV
  getUav: async (req, res) => {
    try {
      const { uavId } = req.params;
      const uav = await UAV.findByPk(uavId);
      
      if (!uav) {
        return res.status(404).json({
          success: false,
          message: 'UAV not found'
        });
      }
      
      res.json({
        success: true,
        uav: uav
      });
    } catch (error) {
      logger.error('Error fetching UAV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch UAV',
        error: error.message
      });
    }
  },

  // Create new UAV
  createUav: async (req, res) => {
    try {
      const { uav_id, model, manufacturer, max_payload, max_range, max_flight_time, battery_capacity, status = 'available' } = req.body;
      
      if (!uav_id || !model) {
        return res.status(400).json({
          success: false,
          message: 'UAV ID and model are required'
        });
      }
      
      const uav = await UAV.create({
        uav_id,
        model,
        manufacturer,
        max_payload,
        max_range,
        max_flight_time,
        battery_capacity,
        current_battery: battery_capacity,
        status
      });
      
      logger.info(`UAV created: ${uav.id} - ${uav.uav_id}`);
      
      res.status(201).json({
        success: true,
        message: 'UAV created successfully',
        uav: uav
      });
    } catch (error) {
      logger.error('Error creating UAV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create UAV',
        error: error.message
      });
    }
  },

  // Update UAV
  updateUav: async (req, res) => {
    try {
      const { uavId } = req.params;
      const updateData = req.body;
      
      const uav = await UAV.findByPk(uavId);
      if (!uav) {
        return res.status(404).json({
          success: false,
          message: 'UAV not found'
        });
      }
      
      await uav.update(updateData);
      
      logger.info(`UAV updated: ${uav.id} - ${uav.uav_id}`);
      
      res.json({
        success: true,
        message: 'UAV updated successfully',
        uav: uav
      });
    } catch (error) {
      logger.error('Error updating UAV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update UAV',
        error: error.message
      });
    }
  },

  // Delete UAV
  deleteUav: async (req, res) => {
    try {
      const { uavId } = req.params;
      
      const uav = await UAV.findByPk(uavId);
      if (!uav) {
        return res.status(404).json({
          success: false,
          message: 'UAV not found'
        });
      }
      
      await uav.destroy();
      
      logger.info(`UAV deleted: ${uavId}`);
      
      res.json({
        success: true,
        message: 'UAV deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting UAV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete UAV',
        error: error.message
      });
    }
  },

  // Get UAV status
  getUavStatus: async (req, res) => {
    try {
      const { uavId } = req.params;
      
      const uav = await UAV.findByPk(uavId, {
        attributes: ['id', 'uav_id', 'model', 'status', 'current_battery', 'current_location_lat', 'current_location_lng', 'updated_at']
      });
      
      if (!uav) {
        return res.status(404).json({
          success: false,
          message: 'UAV not found'
        });
      }
      
      res.json({
        success: true,
        status: {
          id: uav.id,
          uav_id: uav.uav_id,
          model: uav.model,
          status: uav.status,
          current_battery: uav.current_battery,
          location: {
            lat: uav.current_location_lat,
            lng: uav.current_location_lng
          },
          last_updated: uav.updated_at
        }
      });
    } catch (error) {
      logger.error('Error fetching UAV status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch UAV status',
        error: error.message
      });
    }
  }
};

module.exports = uavController; 