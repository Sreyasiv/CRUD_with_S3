const express = require('express');
const s3 = require('../s3');
const router = express.Router();

router.delete('/file/:key', async (req, res) => {
  const key = decodeURIComponent(req.params.key); // in case URL encoded

  if (!key) {
    return res.status(400).json({ error: 'Missing file key in request' });
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.headObject(params).promise(); // ❗Check if file exists

    await s3.deleteObject(params).promise();

    res.status(200).json({ message: '🗑️ File deleted successfully' });
  } catch (err) {
    if (err.code === 'NotFound') {
      return res.status(404).json({ error: 'File not found' });
    }

    console.error('❌ Error deleting file:', err);
    res.status(500).json({ error: 'Failed to delete file', details: err.message });
  }
});

module.exports = router;
