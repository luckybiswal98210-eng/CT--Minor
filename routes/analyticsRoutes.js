const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Ticket statistics and charts data
router.get('/stats', analyticsController.getStats);

// Cloud telemetry, health status, and SLA observability metrics
router.get('/cloud-telemetry', analyticsController.getCloudTelemetry);

module.exports = router;
