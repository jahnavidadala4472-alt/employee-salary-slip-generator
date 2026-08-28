const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UserRepo } = require('../services/dataService');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await UserRepo.findById(decoded.id);

    if (!user || user.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'User session is invalid or account is deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or tampered authentication token.'
    });
  }
};

module.exports = { authenticate };
