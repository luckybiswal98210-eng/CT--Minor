const cloudinary = require('cloudinary').v2;

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('✅ Cloudinary Cloud Object Storage configured.');
} else {
  console.log('ℹ️ Cloudinary credentials not detected. Operating in Cloud-Emulated Object Storage mode.');
}

const getStorageState = () => ({
  isCloudinary: isConfigured,
  provider: isConfigured ? 'Cloudinary (Cloud Object Storage / CDN)' : 'Cloud-Emulated Object Storage (Local Bucket)',
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'emulated-s3-bucket',
  status: 'ONLINE'
});

module.exports = { cloudinary, isConfigured, getStorageState };
