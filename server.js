require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const cloudMetrics = require('./config/cloudMetrics');

const complaintRoutes = require('./routes/complaintRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Cloud Middleware Configuration
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloud Telemetry Middleware (Tracks API Latency & Throughput)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    cloudMetrics.recordRequest(duration);
  });
  next();
});

// Static Assets (Web Client & Uploads)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// REST API Endpoints
// ==========================================
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint for Cloud PaaS (e.g. Render / AWS Health Probe)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Fallback for SPA routing & 404s
app.use((req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found on Cloud Gateway' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Cloud Server Exception:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Cloud Application Error'
  });
});

// ==========================================
// Server Initialization
// ==========================================
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('========================================================');
      console.log(`🚀 Cloud Complaint Management Server running on port ${PORT}`);
      console.log(`🌐 Citizen Portal: http://localhost:${PORT}`);
      console.log(`⚙️ Admin Console: http://localhost:${PORT}/admin.html`);
      console.log(`📊 Cloud Analytics & SLA: http://localhost:${PORT}/analytics.html`);
      console.log(`☁️ Cloud Architecture & Viva: http://localhost:${PORT}/architecture.html`);
      console.log('========================================================');
    });
  } catch (err) {
    console.error('Fatal Cloud Server Startup Error:', err);
    process.exit(1);
  }
};

startServer();
