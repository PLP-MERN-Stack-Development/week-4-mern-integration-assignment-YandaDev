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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email avatar')
      .populate('category', 'name')
      .populate('comments.user', 'username avatar');
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Increment view count
    await post.incrementViewCount();
    
    res.json(post);
  } catch (err) {
    console.error('Post fetch error:', err);
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
    body('category').notEmpty().withMessage('Category is required'),
    body('tags').optional()
  ],
  async (req, res, next) => {
    try {
      console.log('POST /api/posts - Request body:', req.body);
      console.log('POST /api/posts - Authenticated user:', req.user);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const postData = {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        author: req.user, // auth middleware sets req.user to user ID
        featuredImage: req.file ? req.file.filename : 'default-post.jpg'
      };

      // Generate slug manually since pre-save hook isn't working
      let baseSlug = req.body.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      
      // Ensure uniqueness
      let slug = baseSlug;
      let counter = 1;
      while (await Post.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      postData.slug = slug;

      // Handle tags: convert comma-separated string to array
      if (req.body.tags && typeof req.body.tags === 'string') {
        postData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (req.body.tags && Array.isArray(req.body.tags)) {
        postData.tags = req.body.tags;
      }

      console.log('POST /api/posts - postData:', postData);

      const post = new Post(postData);
      await post.save();
      await post.populate('author', 'username email');
      await post.populate('category', 'name');
      
      res.status(201).json(post);
    } catch (err) {
      console.error('Post creation error:', err);
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
    body('category').optional(),
    body('tags').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      
      // Check if user owns the post
      if (post.author.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this post' });
      }

      const updateData = { ...req.body };
      if (req.file) {
        updateData.featuredImage = req.file.filename;
      }

      // Handle tags: convert comma-separated string to array
      if (req.body.tags && typeof req.body.tags === 'string') {
        updateData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (req.body.tags && Array.isArray(req.body.tags)) {
        updateData.tags = req.body.tags;
      }

      const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true })
        .populate('author', 'username email')
        .populate('category', 'name');
      
      res.json(updatedPost);
    } catch (err) {
      console.error('Post update error:', err);
      next(err);
    }
  }
);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', auth, param('id').isMongoId(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Post deletion error:', err);
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      await post.addComment(req.user, req.body.content);
      await post.populate('comments.user', 'username avatar');
      
      res.status(201).json(post.comments);
    } catch (err) {
      console.error('Comment creation error:', err);
      next(err);
    }
  }
);

module.exports = router;