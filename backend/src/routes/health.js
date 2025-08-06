const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Basic server info
    const serverInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'echo-stories',
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    // If database is not connected, return error status
    if (dbStatus === 'disconnected') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Database connection lost',
        data: serverInfo,
      });
    }

    res.json({
      success: true,
      message: 'Echo Stories API is running',
      data: serverInfo,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/health/db - Database-specific health check
router.get('/db', async (req, res) => {
  try {
    // Try to ping the database
    await mongoose.connection.db.admin().ping();
    
    const dbInfo = {
      status: 'connected',
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    };

    res.json({
      success: true,
      message: 'Database connection is healthy',
      data: dbInfo,
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      message: 'Database connection failed',
      details: error.message,
    });
  }
});

module.exports = router;