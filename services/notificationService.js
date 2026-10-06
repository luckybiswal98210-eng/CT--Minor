const nodemailer = require('nodemailer');
const cloudMetrics = require('../config/cloudMetrics');

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log('✅ Cloud Notification Service: SMTP transporter initialized.');
} else {
  console.log('ℹ️ SMTP not configured. Cloud Notification Service running in Event-Webhook Simulation mode.');
}

const notificationService = {
  sendComplaintCreatedNotification: async (complaint) => {
    const subject = `[Cloud Ticket #${complaint.trackingId}] Complaint Registered Successfully`;
    const message = `
Hello ${complaint.complainantName},

Your grievance has been successfully lodged in the Cloud-Based Complaint Management System.

----------------------------------------------------
Tracking ID : ${complaint.trackingId}
Category    : ${complaint.category}
Priority    : ${complaint.priority}
Title       : ${complaint.title}
Status      : ${complaint.status}
Cloud SLA   : 24 - 48 Hours Resolution Target
----------------------------------------------------

You can track your live ticket progress using your Tracking ID on the Cloud Portal.

Best regards,
Cloud Technology Complaint Grievance Cell
    `;

    if (transporter && complaint.complainantEmail) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Cloud Complaint System" <noreply@cloudcomplaint.io>',
          to: complaint.complainantEmail,
          subject,
          text: message
        });
        console.log(`✉️ Email dispatched to ${complaint.complainantEmail} via SMTP`);
      } catch (err) {
        console.warn('Failed to send SMTP email:', err.message);
      }
    }

    cloudMetrics.logCloudEvent('NOTIFICATION_TICKET_CREATED', `Dispatched notification for ticket #${complaint.trackingId} to ${complaint.complainantEmail}`);
  },

  sendStatusUpdateNotification: async (complaint, oldStatus, newStatus, comments) => {
    const subject = `[Status Update: ${newStatus}] Cloud Ticket #${complaint.trackingId}`;
    const message = `
Hello ${complaint.complainantName},

Your complaint status has been updated in our Cloud Management System.

----------------------------------------------------
Tracking ID    : ${complaint.trackingId}
Previous Status: ${oldStatus}
Current Status : ${newStatus}
Officer Remarks: ${comments || 'No remarks provided'}
Updated At     : ${new Date().toLocaleString()}
----------------------------------------------------

Thank you for your patience.

Best regards,
Cloud Grievance Cell
    `;

    if (transporter && complaint.complainantEmail) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Cloud Complaint System" <noreply@cloudcomplaint.io>',
          to: complaint.complainantEmail,
          subject,
          text: message
        });
        console.log(`✉️ Status update email dispatched to ${complaint.complainantEmail}`);
      } catch (err) {
        console.warn('Failed to send status update email:', err.message);
      }
    }

    cloudMetrics.logCloudEvent('NOTIFICATION_STATUS_UPDATE', `Ticket #${complaint.trackingId} transitioned from [${oldStatus}] to [${newStatus}]`);
  }
};

module.exports = notificationService;
