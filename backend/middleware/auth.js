const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Middleware to verify Clerk JWT token
const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error('Clerk auth error:', error);
    return {
      status: 401,
      error: 'Unauthorized: Invalid or missing authentication token'
    };
  }
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  const userId = req.auth?.userId;
  
  if (!userId || !adminUserIds.includes(userId)) {
    return res.status(403).json({
      error: 'Forbidden: Admin access required'
    });
  }
  
  next();
};

// Middleware to extract user info from Clerk auth
const extractUserInfo = (req, res, next) => {
  if (req.auth) {
    req.userId = req.auth.userId;
    req.user = req.auth;
  }
  next();
};

// Optional auth middleware (doesn't require authentication)
const optionalAuth = (req, res, next) => {
  // If authorization header exists, try to verify it
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Use Clerk verification if token exists
    return requireAuth(req, res, (err) => {
      if (err) {
        // If token is invalid, continue without auth
        req.auth = null;
        req.userId = null;
      } else {
        req.userId = req.auth?.userId;
      }
      next();
    });
  }
  
  // No token provided, continue without auth
  req.auth = null;
  req.userId = null;
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  extractUserInfo,
  optionalAuth
};