// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Your User model

// PROTECT ROUTE – Verify JWT token + load user

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from header (Bearer token)
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to access this route.',
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 4. Optional: Check if password changed after token issued
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return res.status(401).json({ message: 'Password recently changed. Please log in again.' });
    // }

    // Grant access – attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    // Any other error
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// AUTHORIZE – Restrict to specific roles
// Usage: restrictTo('Admin', 'PFO')

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};