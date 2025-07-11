const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Post = require('../models/Post');
const router = express.Router();

// GET /api/posts - Get all posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().populate('author category');
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id - Get a specific post
router.get('/:id', param('id').isMongoId(), async (req, res, next) => {
  try {
    validationResult(req).throw();
    const post = await Post.findById(req.params.id).populate('author category');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts - Create a new post
router.post(
  '/',
  body('title').notEmpty().isLength({ max: 100 }),
  body('content').notEmpty(),
  body('author').isMongoId(),
  body('category').isMongoId(),
  async (req, res, next) => {
    try {
      validationResult(req).throw();
      const post = new Post(req.body);
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/posts/:id - Update a post
router.put(
  '/:id',
  param('id').isMongoId(),
  body('title').optional().isLength({ max: 100 }),
  body('content').optional(),
  async (req, res, next) => {
    try {
      validationResult(req).throw();
      const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', param('id').isMongoId(), async (req, res, next) => {
  try {
    validationResult(req).throw();
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;