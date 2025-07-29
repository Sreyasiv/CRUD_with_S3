const express = require('express');
const s3 = require('../s3');

const router = express.Router();

router.get('/files', async (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map(file => ({
      key: file.Key,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      size: file.Size,
      lastModified: file.LastModified
    }));
    res.json(files);
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

module.exports = router;
