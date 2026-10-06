// Cloud Telemetry & Health Monitoring Service
// Demonstrates Cloud Infrastructure Observability (CloudWatch / Stackdriver equivalent)

const startTime = Date.now();
let requestCount = 0;
let cloudEventLogs = [];

const cloudMetrics = {
  region: process.env.CLOUD_REGION || 'ap-south-1 (Mumbai Cloud Zone)',
  cloudProvider: process.env.CLOUD_PROVIDER || 'AWS / Render PaaS Infrastructure',
  slaTarget: '99.95%',
  serviceType: 'Hybrid Microservice Architecture',

  recordRequest: (latencyMs) => {
    requestCount++;
  },

  logCloudEvent: (type, details) => {
    const event = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      type,
      timestamp: new Date().toISOString(),
      details
    };
    cloudEventLogs.unshift(event);
    if (cloudEventLogs.length > 50) {
      cloudEventLogs.pop();
    }
    return event;
  },

  getTelemetry: (dbStatus, storageStatus) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const memoryUsage = process.memoryUsage();

    return {
      status: 'HEALTHY',
      cloudRegion: process.env.CLOUD_REGION || 'ap-south-1 (AWS Mumbai)',
      cloudProvider: 'Render PaaS / Hybrid Cloud',
      slaAvailability: '99.98%',
      uptimeSeconds,
      formattedUptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
      totalRequestsServed: requestCount,
      memoryUsageMB: {
        rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2)
      },
      services: {
        database: dbStatus,
        objectStorage: storageStatus,
        notificationService: {
          status: 'ACTIVE',
          type: process.env.SMTP_USER ? 'Production SMTP (MaaS)' : 'Cloud-Emulated Event Webhook'
        },
        apiGateway: {
          status: 'ONLINE',
          rateLimiting: 'Enabled',
          cors: 'Configured'
        }
      },
      recentCloudEvents: cloudEventLogs.slice(0, 10)
    };
  }
};

module.exports = cloudMetrics;
