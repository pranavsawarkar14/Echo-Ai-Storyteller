const express = require('express');
const Story = require('../models/Story');
const router = express.Router();

// GET /api/stories - Get all stories for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    const stories = await Story.findByUser(userId);
    
    res.json({
      success: true,
      data: stories,
      message: `Found ${stories.length} stories`,
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch stories',
    });
  }
});

// POST /api/stories - Create a new story
router.post('/', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const {
      title,
      content,
      category,
      duration,
      description,
      chapters,
      author,
      generationParams,
      isPublic = false,
    } = req.body;

    // Validation
    if (!title || !content || !description) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Title, content, and description are required',
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Title must be less than 200 characters',
      });
    }

    if (content.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Content must be less than 50,000 characters',
      });
    }

    const newStory = new Story({
      title: title.trim(),
      content,
      category: category || 'Adventure',
      duration: duration || 'Short (5-10 min)',
      description: description.trim(),
      chapters: chapters || [],
      author: author || 'Echo AI',
      userId,
      generationParams,
      isPublic,
      moderationStatus: isPublic ? 'pending' : 'approved', // Public stories need moderation
    });

    const savedStory = await newStory.save();

    res.status(201).json({
      success: true,
      data: savedStory,
      message: 'Story created successfully',
    });
  } catch (error) {
    console.error('Error creating story:', error);
    
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
      message: 'Failed to create story',
    });
  }
});

// GET /api/stories/:id - Get a specific story
router.get('/:id', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const story = await Story.findOne({ 
      _id: id, 
      $or: [
        { userId }, // User's own story
        { isPublic: true, moderationStatus: 'approved' } // Or public approved story
      ]
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Story not found or access denied',
      });
    }

    // Increment play count if it's not the owner viewing
    if (story.userId !== userId) {
      story.incrementPlayCount();
    }

    res.json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch story',
    });
  }
});

// PATCH /api/stories/:id - Update a story
router.patch('/:id', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates._id;
    delete updates.playCount;

    const story = await Story.findOne({ _id: id, userId });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Story not found or access denied',
      });
    }

    // If making story public, require moderation
    if (updates.isPublic && !story.isPublic) {
      updates.moderationStatus = 'pending';
    }

    Object.assign(story, updates);
    const updatedStory = await story.save();

    res.json({
      success: true,
      data: updatedStory,
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

// DELETE /api/stories/:id - Delete a story
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const story = await Story.findOneAndDelete({ _id: id, userId });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Story not found or access denied',
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

// GET /api/stories/public/search - Search public stories
router.get('/public/search', async (req, res) => {
  try {
    const { 
      query, 
      category, 
      limit = 20, 
      skip = 0 
    } = req.query;

    let searchQuery = {
      isPublic: true,
      moderationStatus: 'approved',
    };

    if (category && category !== 'All') {
      searchQuery.category = category;
    }

    let stories;
    if (query) {
      // Text search
      stories = await Story.find({
        ...searchQuery,
        $text: { $search: query }
      })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    } else {
      // Regular query
      stories = await Story.find(searchQuery)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
    }

    res.json({
      success: true,
      data: stories,
      message: `Found ${stories.length} stories`,
    });
  } catch (error) {
    console.error('Error searching stories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to search stories',
    });
  }
});

module.exports = router;