const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const complaintController = require('../controllers/complaintController');

// Submit a new complaint (with optional attachment file upload)
router.post('/', upload.single('attachment'), complaintController.createComplaint);

// Track complaint by unique tracking ID
router.get('/track/:trackingId', complaintController.getComplaintByTrackingId);

// Get all complaints with query filters (Admin console)
router.get('/', complaintController.getAllComplaints);

// Update status of complaint
router.patch('/:id/status', complaintController.updateComplaintStatus);

// Submit feedback for a resolved complaint
router.post('/:trackingId/feedback', complaintController.submitFeedback);

module.exports = router;
