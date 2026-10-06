const Complaint = require('../models/Complaint');
const cloudMetrics = require('../config/cloudMetrics');
const { getDbState } = require('../config/db');
const { getStorageState } = require('../config/cloudinary');

const analyticsController = {
  // GET /api/analytics/stats
  getStats: async (req, res) => {
    try {
      const stats = await Complaint.getStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics stats.',
        error: err.message
      });
    }
  },

  // GET /api/analytics/cloud-telemetry
  getCloudTelemetry: async (req, res) => {
    try {
      const dbState = getDbState();
      const storageState = getStorageState();
      const telemetry = cloudMetrics.getTelemetry(dbState, storageState);

      return res.status(200).json({
        success: true,
        data: telemetry
      });
    } catch (err) {
      console.error('Error fetching cloud telemetry:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cloud telemetry.',
        error: err.message
      });
    }
  }
};

module.exports = analyticsController;
