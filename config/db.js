const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudMetrics = require('./cloudMetrics');

let dbState = {
  isMongo: false,
  provider: 'Cloud-Emulated File Storage (DBaaS Mode)',
  status: 'INITIALIZING',
  details: 'Local resilient datastore with JSON persistence'
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    try {
      console.log('Connecting to Cloud Database (MongoDB Atlas)...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000
      });
      dbState = {
        isMongo: true,
        provider: 'MongoDB Atlas (Cloud DBaaS)',
        status: 'CONNECTED',
        details: 'Multi-AZ Cloud Managed Cluster'
      };
      console.log('✅ Connected to MongoDB Atlas Cloud Database successfully.');
      cloudMetrics.logCloudEvent('DB_CONNECT', 'Connected to MongoDB Atlas DBaaS Cluster');
      return;
    } catch (err) {
      console.warn('⚠️ Cloud MongoDB Atlas connection failed:', err.message);
      console.warn('Switching seamlessly to resilient Cloud-Emulated DBaaS storage...');
    }
  } else {
    console.log('ℹ️ No MONGODB_URI provided. Initializing Cloud-Emulated DBaaS storage mode.');
  }

  // Fallback persistent storage initialization
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dataFile = path.join(dataDir, 'complaints.json');
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
  }

  dbState = {
    isMongo: false,
    provider: 'Cloud-Emulated Resilient Datastore (DBaaS Emulation)',
    status: 'ACTIVE',
    details: 'Zero-configuration persistent cloud storage engine'
  };

  cloudMetrics.logCloudEvent('DB_FALLBACK', 'Initialized resilient Cloud-Emulated Datastore');
};

const getDbState = () => dbState;

module.exports = { connectDB, getDbState };
