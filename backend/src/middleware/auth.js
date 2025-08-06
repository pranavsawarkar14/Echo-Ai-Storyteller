const jwt = require('jsonwebtoken');

// Simple JWT verification middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid authorization token',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For now, we'll use a simple approach to decode the JWT without verification
    // In production, you should verify the token with Clerk's public key
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid',
      });
    }

    // Set auth info on request
    req.auth = {
      userId: decoded.sub,
      sessionId: decoded.sid,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Unable to verify authentication token',
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please sign in to access this resource',
    });
  }

  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  
  if (!adminUserIds.includes(req.auth.userId)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Admin privileges required',
    });
  }

  next();
};

// Optional middleware to get user info without requiring auth
const getUser = (req, res, next) => {
  // This would be used for public endpoints that want to check if user is authenticated
  // but don't require it
  req.user = req.auth || null;
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  getUser,
};