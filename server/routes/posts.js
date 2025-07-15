const express = require('express');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/posts - Get all posts with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const posts = await Post.find(query)
      .populate('author', 'username email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/search - Search posts
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .populate('author', 'username email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id - Get a specific post
router.get('/:id', param('id').isMongoId(), async (req, res, next) => {
  try {
    validationResult(req).throw();
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email avatar')
      .populate('category', 'name')
      .populate('comments.user', 'username avatar');
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Increment view count
    await post.incrementViewCount();
    
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts - Create a new post
router.post(
  '/',
  auth,
  upload.single('featuredImage'),
  [
    body('title').notEmpty().isLength({ max: 100 }),
    body('content').notEmpty(),
    body('category').isMongoId(),
    body('tags').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      validationResult(req).throw();
      
      const postData = {
        ...req.body,
        author: req.user,
        featuredImage: req.file ? req.file.filename : 'default-post.jpg'
      };

      if (req.body.tags && typeof req.body.tags === 'string') {
        postData.tags = req.body.tags.split(',').map(tag => tag.trim());
      }

      const post = new Post(postData);
      await post.save();
      await post.populate('author', 'username email');
      await post.populate('category', 'name');
      
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/posts/:id - Update a post
router.put(
  '/:id',
  auth,
  upload.single('featuredImage'),
  [
    param('id').isMongoId(),
    body('title').optional().isLength({ max: 100 }),
    body('content').optional(),
    body('category').optional().isMongoId(),
    body('tags').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      validationResult(req).throw();
      
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      
      // Check if user owns the post
      if (post.author.toString() !== req.user) {
        return res.status(403).json({ error: 'Not authorized to update this post' });
      }

      const updateData = { ...req.body };
      if (req.file) {
        updateData.featuredImage = req.file.filename;
      }

      if (req.body.tags && typeof req.body.tags === 'string') {
        updateData.tags = req.body.tags.split(',').map(tag => tag.trim());
      }

      const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true })
        .populate('author', 'username email')
        .populate('category', 'name');
      
      res.json(updatedPost);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', auth, param('id').isMongoId(), async (req, res, next) => {
  try {
    validationResult(req).throw();
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if user owns the post
    if (post.author.toString() !== req.user) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/comments - Add a comment to a post
router.post(
  '/:id/comments',
  auth,
  [
    param('id').isMongoId(),
    body('content').notEmpty().isLength({ min: 1, max: 500 })
  ],
  async (req, res, next) => {
    try {
      validationResult(req).throw();
      
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      await post.addComment(req.user, req.body.content);
      await post.populate('comments.user', 'username avatar');
      
      res.status(201).json(post.comments);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;