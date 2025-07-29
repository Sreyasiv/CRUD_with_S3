const express = require('express');
const multer = require('multer');
const fs = require('fs');
const s3 = require('../s3'); // your v2 S3 instance

const router = express.Router();

// Set up multer (temp uploads folder)
const upload = multer({ dest: 'uploads/' });

router.put('/update/:key', upload.single('file'), async (req, res) => {
  const file = req.file;
  const key = decodeURIComponent(req.params.key); // decode URL-safe characters

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded. Use form-data with key "file".' });
  }

  const fileStream = fs.createReadStream(file.path);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  try {
    s3.upload(params, (err, data) => {
      // Delete temp file either way
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) console.warn('Temp file deletion failed:', unlinkErr.message);
      });

      if (err) {
        console.error('❌ Update Failed:', err);
        return res.status(500).json({ error: 'Failed to update file', details: err.message });
      }

      res.json({
        message: `✅ File "${key}" updated successfully`,
        s3Url: data.Location,
      });
    });
  } catch (err) {
    console.error('🔥 Internal Error:', err);
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
});

module.exports = router;
