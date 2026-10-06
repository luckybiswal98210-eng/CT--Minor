const Complaint = require('../models/Complaint');
const storageService = require('../services/storageService');
const notificationService = require('../services/notificationService');
const cloudMetrics = require('../config/cloudMetrics');

const complaintController = {
  // POST /api/complaints
  createComplaint: async (req, res) => {
    try {
      const {
        title,
        category,
        priority,
        description,
        complainantName,
        complainantEmail,
        complainantPhone,
        department
      } = req.body;

      if (!title || !category || !description || !complainantName || !complainantEmail) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all mandatory fields (Title, Category, Description, Name, Email).'
        });
      }

      // Handle file upload to Cloud Storage (Cloudinary or local resilient fallback)
      let attachment = null;
      if (req.file) {
        attachment = await storageService.uploadFile(req.file);
      }

      const newComplaint = await Complaint.create({
        title,
        category,
        priority: priority || 'Medium',
        description,
        complainantName,
        complainantEmail,
        complainantPhone,
        department: department || 'General Helpdesk',
        attachment
      });

      // Send cloud notification asynchronously
      notificationService.sendComplaintCreatedNotification(newComplaint);

      cloudMetrics.logCloudEvent('COMPLAINT_CREATED', `New ticket created: ${newComplaint.trackingId} by ${complainantEmail}`);

      return res.status(201).json({
        success: true,
        message: 'Grievance ticket created successfully in Cloud Management System.',
        data: {
          trackingId: newComplaint.trackingId,
          title: newComplaint.title,
          category: newComplaint.category,
          status: newComplaint.status,
          priority: newComplaint.priority,
          createdAt: newComplaint.createdAt,
          attachment: newComplaint.attachment
        }
      });
    } catch (err) {
      console.error('Error creating complaint:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal Cloud Server Error while filing complaint.',
        error: err.message
      });
    }
  },

  // GET /api/complaints/track/:trackingId
  getComplaintByTrackingId: async (req, res) => {
    try {
      const { trackingId } = req.params;
      const complaint = await Complaint.findByTrackingId(trackingId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: `Ticket #${trackingId} not found in the Cloud Database.`
        });
      }

      return res.status(200).json({
        success: true,
        data: complaint
      });
    } catch (err) {
      console.error('Error finding complaint:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching ticket details from Cloud Database.',
        error: err.message
      });
    }
  },

  // GET /api/complaints (Admin filterable)
  getAllComplaints: async (req, res) => {
    try {
      const { status, category, priority, search } = req.query;
      const filter = {};
      if (status && status !== 'All') filter.status = status;
      if (category && category !== 'All') filter.category = category;
      if (priority && priority !== 'All') filter.priority = priority;
      if (search) filter.search = search;

      const complaints = await Complaint.find(filter);

      return res.status(200).json({
        success: true,
        count: complaints.length,
        data: complaints
      });
    } catch (err) {
      console.error('Error fetching complaints list:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve tickets.',
        error: err.message
      });
    }
  },

  // PATCH /api/complaints/:id/status
  updateComplaintStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments, updatedBy, assignedOfficer, department, resolutionNotes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'New status is required.'
        });
      }

      const existing = await Complaint.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found.'
        });
      }

      const oldStatus = existing.status;
      const updated = await Complaint.updateStatus(
        id,
        status,
        comments,
        updatedBy || 'Cloud Admin Officer',
        assignedOfficer,
        department,
        resolutionNotes
      );

      // Trigger Cloud Notification
      notificationService.sendStatusUpdateNotification(updated, oldStatus, status, comments);

      cloudMetrics.logCloudEvent('STATUS_UPDATED', `Ticket #${updated.trackingId} updated: ${oldStatus} -> ${status}`);

      return res.status(200).json({
        success: true,
        message: `Ticket status successfully updated to [${status}].`,
        data: updated
      });
    } catch (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update ticket status.',
        error: err.message
      });
    }
  },

  // POST /api/complaints/:trackingId/feedback
  submitFeedback: async (req, res) => {
    try {
      const { trackingId } = req.params;
      const { rating, comments } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5.'
        });
      }

      const updated = await Complaint.submitFeedback(trackingId, rating, comments);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Ticket #${trackingId} not found.`
        });
      }

      cloudMetrics.logCloudEvent('FEEDBACK_SUBMITTED', `User submitted ${rating}-star feedback for #${trackingId}`);

      return res.status(200).json({
        success: true,
        message: 'Feedback recorded successfully. Thank you!',
        data: updated
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit feedback.',
        error: err.message
      });
    }
  }
};

module.exports = complaintController;
