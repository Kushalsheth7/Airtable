const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth middleware - Headers:', {
      authorization: authHeader,
      hasAuthHeader: !!authHeader,
      allHeaders: Object.keys(req.headers)
    });

    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('Auth middleware - Token:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });

    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and check if still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found or inactive'
      });
    }

    // Check if Airtable token is expired
    if (user.isTokenExpired()) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Airtable access token has expired. Please re-authenticate.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};
