const fs = require('fs');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const cloudMetrics = require('../config/cloudMetrics');

const storageService = {
  uploadFile: async (file) => {
    if (!file) return null;

    if (isConfigured) {
      try {
        console.log(`Cloud Upload: Streaming ${file.originalname} to Cloudinary...`);
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'cloud_complaints',
          resource_type: 'auto'
        });

        // Clean up temporary local file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        cloudMetrics.logCloudEvent('CLOUD_STORAGE_UPLOAD', `Uploaded ${file.originalname} to Cloudinary CDN`);

        return {
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          storageProvider: 'Cloudinary Cloud Object Storage (PaaS CDN)',
          uploadedAt: new Date()
        };
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to local bucket:', err.message);
      }
    }

    // Fallback: Local Cloud-Emulated Object Storage
    const publicUrl = `/uploads/${path.basename(file.path)}`;
    cloudMetrics.logCloudEvent('STORAGE_STORE_LOCAL', `Stored ${file.originalname} in Cloud-Emulated Object Bucket`);

    return {
      url: publicUrl,
      publicId: path.basename(file.path),
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      storageProvider: 'Cloud-Emulated Object Storage Bucket (Local)',
      uploadedAt: new Date()
    };
  }
};

module.exports = storageService;
