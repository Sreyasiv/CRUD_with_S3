const express = require('express');
require('dotenv').config()
const multer = require('multer');
const fs = require('fs');
const AWS = require('aws-sdk');
const router = express.Router();

// Multer storage setup (temp 'uploads/' folder)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, but you can restrict to mimetypes if needed
    if (!file.originalname) {
      return cb(new Error('File must have a valid name'));
    }
    cb(null, true);
  },
});

// AWS S3 Config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

console.log('🔍 Upload Params:', {
  Bucket: process.env.AWS_BUCKET_NAME,
  AccessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.slice(0, 5),
  Region: process.env.AWS_REGION
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    // ⛔ File missing
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded. Please attach a file with the key "file".' });
    }

    const fileStream = fs.createReadStream(file.path);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // 🔄 dynamic from .env
      Key: file.originalname,
      Body: fileStream,
      ContentType: file.mimetype,
    };

    // ✅ Upload to S3
    s3.upload(params, (err, data) => {
      // Always remove local file whether success or error
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) console.warn('Temp file deletion failed:', unlinkErr.message);
      });

      if (err) {
              console.error('❌ S3 Upload Error (Full):', JSON.stringify(err, null, 2)); // 💥 THIS
              return res.status(500).json({ error: 'Upload to S3 failed', details: err.message });
      }
      res.status(200).json({
        message: '✅ File uploaded successfully',
        s3Url: data.Location,
      });
    });

  } catch (err) {
    console.error('🔥 Internal Error:', err);
    return res.status(500).json({
      error: 'Server encountered an error',
      details: err.message,
    });
  }
});

module.exports = router;
