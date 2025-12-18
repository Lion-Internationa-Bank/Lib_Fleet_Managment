// backend/src/middleware/errorHandler.js
import mongoose from 'mongoose';
// import jwt from 'jsonwebtoken';  // ← Only this line

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || 'Server Error';
  error.statusCode = err.statusCode || 500;

  console.error('ERROR:', {
    message: err.message,
    name: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : 'Hidden',
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?._id || 'guest',
    time: new Date().toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' }),
  });

  // 1. Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    error.message = `Invalid ID: ${err.value}`;
    error.statusCode = 400;
  }

  // 2. Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(e => e.message);
    error.message = `Validation Error: ${messages.join(', ')}`;
    error.statusCode = 400;
  }

  // 3. Duplicate key (plate_no already exists)

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} '${err.keyValue[field]}' already exists`;
    error.statusCode = 409;
  }

  // 4. JWT Errors – USE err.name (jsonwebtoken has no named exports!)
//   if (err.name === 'JsonWebTokenError') {
//     error.message = 'Invalid token. Please log in again';
//     error.statusCode = 401;
//   }

//   if (err.name === 'TokenExpiredError') {
//     error.message = 'Token expired. Please log in again';
//     error.statusCode = 401;
//   }

  // 5. Multer upload errors
  if (typeof err.code === 'string' && err.code.startsWith('LIMIT_')) {
    error.message = 'File too large or too many files';
    error.statusCode = 400;
  }

  // 6. SyntaxError (invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'Invalid JSON payload';
    error.statusCode = 400;
  }

  // Production: hide stack trace
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(isDev && { stack: err.stack }),
    ...(isDev && { name: err.name }),
  });
};

export default errorHandler;