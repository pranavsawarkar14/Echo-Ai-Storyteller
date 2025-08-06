const express = require('express');
const { requireAuth, extractUserInfo } = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/me - Get current user info
router.get('/me', requireAuth, extractUserInfo, async (req, res) => {
  try {
    // Get user info from Clerk
    const userInfo = {
      userId: req.auth.userId,
      sessionId: req.auth.sessionId,
      // Add any additional user metadata you want to include
    };
    
    res.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({
      error: 'Failed to fetch user information'
    });
  }
});

// POST /api/auth/verify - Verify token (useful for frontend token validation)
router.post('/verify', requireAuth, extractUserInfo, (req, res) => {
  res.json({
    success: true,
    data: {
      userId: req.auth.userId,
      valid: true,
      message: 'Token is valid'
    }
  });
});

module.exports = router;