const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

const uploadToCloudinary = (buffer, folder, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `saree-store/${folder}`, ...options },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    stream.end(buffer);
  });

router.post('/product', protect, adminOnly, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files?.length) { res.status(400); throw new Error('No files uploaded'); }
  const uploads = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer, 'products', { transformation: [{ width: 800, height: 1000, crop: 'fill', quality: 'auto' }] }))
  );
  const images = uploads.map((u) => ({ public_id: u.public_id, url: u.secure_url }));
  res.json({ success: true, images });
}));

router.post('/avatar', protect, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  const result = await uploadToCloudinary(req.file.buffer, 'avatars', {
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  });
  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user._id, {
    avatar: { public_id: result.public_id, url: result.secure_url },
  });
  res.json({ success: true, avatar: { public_id: result.public_id, url: result.secure_url } });
}));

router.delete('/product/:public_id', protect, adminOnly, asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(req.params.public_id);
  res.json({ success: true, message: 'Image deleted' });
}));

module.exports = router;
