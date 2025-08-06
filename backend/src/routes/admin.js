const express = require('express');
const Story = require('../models/Story');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// GET /api/admin/analytics - Get analytics dashboard data
router.get('/analytics', async (req, res) => {
  try {
    // Get overview statistics
    const overviewStats = await Story.getAnalytics();
    const categoryStats = await Story.getCategoryStats();
    const topAuthors = await Story.getTopAuthors();
    const recentActivity = await Story.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title author userId createdAt moderationStatus playCount');

    const overview = overviewStats[0] || {
      totalStories: 0,
      publicStories: 0,
      pendingModeration: 0,
      privateStories: 0,
      totalPlays: 0,
      avgRating: 0,
    };

    res.json({
      success: true,
      data: {
        overview,
        categories: categoryStats,
        topAuthors,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch analytics data',
    });
  }
});

// GET /api/admin/stories/all - Get all stories (admin only)
router.get('/stories/all', async (req, res) => {
  try {
    const { 
      limit = 50, 
      skip = 0, 
      moderationStatus,
      category,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    if (moderationStatus) {
      query.moderationStatus = moderationStatus;
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (userId) {
      query.userId = userId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const stories = await Story.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v'); // Exclude version field

    const totalCount = await Story.countDocuments(query);

    res.json({
      success: true,
      data: stories,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + stories.length) < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching all stories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch stories',
    });
  }
});

// GET /api/admin/stories/pending - Get stories pending moderation
router.get('/stories/pending', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const stories = await Story.findPendingModeration()
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalPending = await Story.countDocuments({ moderationStatus: 'pending' });

    res.json({
      success: true,
      data: stories,
      pagination: {
        total: totalPending,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + stories.length) < totalPending,
      },
    });
  } catch (error) {
    console.error('Error fetching pending stories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch pending stories',
    });
  }
});

// POST /api/admin/stories/:id/moderate - Moderate a story
router.post('/stories/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Action must be either "approve" or "reject"',
      });
    }

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Story not found',
      });
    }

    if (action === 'approve') {
      await story.approve();
    } else {
      await story.reject(reason);
    }

    res.json({
      success: true,
      data: story,
      message: `Story ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error moderating story:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to moderate story',
    });
  }
});

// DELETE /api/admin/stories/:id - Delete any story (admin)
router.delete('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findByIdAndDelete(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Story not found',
      });
    }

    res.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete story',
    });
  }
});

// GET /api/admin/users/stats - Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const userStats = await Story.aggregate([
      {
        $group: {
          _id: '$userId',
          storyCount: { $sum: 1 },
          totalPlays: { $sum: '$playCount' },
          publicStories: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          },
          avgRating: { $avg: '$rating' },
          lastActivity: { $max: '$createdAt' },
        }
      },
      { $sort: { storyCount: -1 } },
      { $limit: 100 }
    ]);

    const totalUsers = userStats.length;
    const activeUsers = userStats.filter(user => {
      const daysSinceLastActivity = (Date.now() - new Date(user.lastActivity)) / (1000 * 60 * 60 * 24);
      return daysSinceLastActivity <= 30;
    }).length;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        userStats: userStats.slice(0, 20), // Top 20 users
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch user statistics',
    });
  }
});

// PATCH /api/admin/stories/:id - Update any story (admin)
router.patch('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.createdAt;
    delete updates.userId; // Admin shouldn't change ownership

    const story = await Story.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Story not found',
      });
    }

    res.json({
      success: true,
      data: story,
      message: 'Story updated successfully',
    });
  } catch (error) {
    console.error('Error updating story:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update story',
    });
  }
});

module.exports = router;