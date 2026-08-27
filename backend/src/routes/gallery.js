const express = require('express');
const asyncHandler = require('express-async-handler');
const GalleryImage = require('../models/GalleryImage');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/gallery - public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const images = await GalleryImage.find(filter).sort({ createdAt: -1 });
    res.json(images);
  })
);

// POST /api/gallery - admin only. imageUrl is expected to already be a hosted URL
// (e.g. uploaded to a service like Cloudinary/S3, or a path under /public).
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, imageUrl, category } = req.body;
    if (!title || !imageUrl) {
      res.status(400);
      throw new Error('Title and imageUrl are required.');
    }
    const image = await GalleryImage.create({ title, imageUrl, category });
    res.status(201).json(image);
  })
);

// DELETE /api/gallery/:id - admin only
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) {
      res.status(404);
      throw new Error('Image not found');
    }
    res.json({ message: 'Image deleted' });
  })
);

module.exports = router;
