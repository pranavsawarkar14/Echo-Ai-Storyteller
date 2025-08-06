const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const Story = require('../models/Story');
const { requireAuth, requireAdmin, extractUserInfo, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateStory = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),
  
  body('category')
    .isIn(['Adventure', 'Mystery', 'Sci-Fi', 'Fantasy', 'Horror', 'Romance', 'Comedy', 'Drama'])
    .withMessage('Invalid category'),
  
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Duration must be less than 20 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  body('chapters')
    .optional()
    .isArray()
    .withMessage('Chapters must be an array'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// GET /api/stories - Get stories for authenticated user
router.get('/', requireAuth, extractUserInfo, async (req, res) => {
  try {
    const { category, limit = 50, skip = 0, sortBy = '-createdAt' } = req.query;
    
    const stories = await Story.findUserStories(req.userId, {
      category,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy
    });
    
    res.json({
      success: true,
      data: stories,
      count: stories.length,
      userId: req.userId
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({
      error: 'Failed to fetch stories',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET /api/stories/public - Get public stories (no auth required)
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const { category, limit = 20, skip = 0, sortBy = '-createdAt' } = req.query;
    
    const stories = await Story.findPublicStories({
      category,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy
    });
    
    res.json({
      success: true,
      data: stories,
      count: stories.length
    });
  } catch (error) {
    console.error('Error fetching public stories:', error);
    res.status(500).json({
      error: 'Failed to fetch public stories',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET /api/stories/all - Admin only: Get all stories
router.get('/all', requireAuth, extractUserInfo, requireAdmin, async (req, res) => {
  try {
    const { 
      category, 
      userId, 
      moderationStatus,
      limit = 50, 
      skip = 0, 
      sortBy = '-createdAt' 
    } = req.query;
    
    const query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (moderationStatus) {
      query.moderationStatus = moderationStatus;
    }
    
    const stories = await Story.find(query)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const totalCount = await Story.countDocuments(query);
    
    res.json({
      success: true,
      data: stories,
      count: stories.length,
      totalCount,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + stories.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching all stories (admin):', error);
    res.status(500).json({
      error: 'Failed to fetch stories',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET /api/stories/:id - Get specific story
router.get('/:id', 
  param('id').isMongoId().withMessage('Invalid story ID'),
  handleValidationErrors,
  optionalAuth,
  async (req, res) => {
    try {
      const story = await Story.findById(req.params.id);
      
      if (!story) {
        return res.status(404).json({
          error: 'Story not found'
        });
      }
      
      // Check if user can access this story
      const canAccess = story.isPublic || 
                       story.userId === req.userId ||
                       (req.userId && process.env.ADMIN_USER_IDS?.split(',').includes(req.userId));
      
      if (!canAccess) {
        return res.status(403).json({
          error: 'Access denied to this story'
        });
      }
      
      // Increment play count for public stories
      if (story.isPublic && req.userId !== story.userId) {
        await story.incrementPlayCount();
      }
      
      res.json({
        success: true,
        data: story.toPublicJSON()
      });
    } catch (error) {
      console.error('Error fetching story:', error);
      res.status(500).json({
        error: 'Failed to fetch story',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }
);

// POST /api/stories - Create new story
router.post('/', 
  requireAuth, 
  extractUserInfo, 
  validateStory, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const storyData = {
        ...req.body,
        userId: req.userId,
        author: req.body.author || 'Echo AI',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const story = new Story(storyData);
      const savedStory = await story.save();
      
      res.status(201).json({
        success: true,
        data: savedStory.toPublicJSON(),
        message: 'Story created successfully'
      });
    } catch (error) {
      console.error('Error creating story:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: Object.values(error.errors).map(e => e.message)
        });
      }
      
      res.status(500).json({
        error: 'Failed to create story',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }
);

// PUT /api/stories/:id - Update story
router.put('/:id',
  param('id').isMongoId().withMessage('Invalid story ID'),
  requireAuth,
  extractUserInfo,
  validateStory,
  handleValidationErrors,
  async (req, res) => {
    try {
      const story = await Story.findById(req.params.id);
      
      if (!story) {
        return res.status(404).json({
          error: 'Story not found'
        });
      }
      
      // Check if user owns this story or is admin
      const isOwner = story.userId === req.userId;
      const isAdmin = process.env.ADMIN_USER_IDS?.split(',').includes(req.userId);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Access denied: You can only edit your own stories'
        });
      }
      
      // Update story
      Object.assign(story, req.body);
      story.updatedAt = new Date();
      
      const updatedStory = await story.save();
      
      res.json({
        success: true,
        data: updatedStory.toPublicJSON(),
        message: 'Story updated successfully'
      });
    } catch (error) {
      console.error('Error updating story:', error);
      res.status(500).json({
        error: 'Failed to update story',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }
);

// DELETE /api/stories/:id - Delete story
router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid story ID'),
  requireAuth,
  extractUserInfo,
  handleValidationErrors,
  async (req, res) => {
    try {
      const story = await Story.findById(req.params.id);
      
      if (!story) {
        return res.status(404).json({
          error: 'Story not found'
        });
      }
      
      // Check if user owns this story or is admin
      const isOwner = story.userId === req.userId;
      const isAdmin = process.env.ADMIN_USER_IDS?.split(',').includes(req.userId);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Access denied: You can only delete your own stories'
        });
      }
      
      await Story.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Story deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      res.status(500).json({
        error: 'Failed to delete story',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }
);

// POST /api/stories/:id/moderate - Admin only: Moderate story
router.post('/:id/moderate',
  param('id').isMongoId().withMessage('Invalid story ID'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
  requireAuth,
  extractUserInfo,
  requireAdmin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { action, reason } = req.body;
      const story = await Story.findById(req.params.id);
      
      if (!story) {
        return res.status(404).json({
          error: 'Story not found'
        });
      }
      
      story.moderationStatus = action === 'approve' ? 'approved' : 'rejected';
      story.moderatedBy = req.userId;
      story.moderatedAt = new Date();
      
      if (reason) {
        story.moderationReason = reason;
      }
      
      await story.save();
      
      res.json({
        success: true,
        data: story,
        message: `Story ${action}d successfully`
      });
    } catch (error) {
      console.error('Error moderating story:', error);
      res.status(500).json({
        error: 'Failed to moderate story',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }
);

// GET /api/stories/stats/analytics - Admin only: Get analytics
router.get('/stats/analytics', requireAuth, extractUserInfo, requireAdmin, async (req, res) => {
  try {
    const totalStories = await Story.countDocuments();
    const publicStories = await Story.countDocuments({ isPublic: true });
    const pendingModeration = await Story.countDocuments({ moderationStatus: 'pending' });
    
    const categoryCounts = await Story.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const topAuthors = await Story.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const recentActivity = await Story.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title userId createdAt category')
      .lean();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalStories,
          publicStories,
          pendingModeration,
          privateStories: totalStories - publicStories
        },
        categories: categoryCounts,
        topAuthors,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

module.exports = router;