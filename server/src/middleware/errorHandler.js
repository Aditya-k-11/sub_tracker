import AppError from '../utils/AppError.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    error = new AppError('A record with this value already exists', 409);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new AppError('Invalid or expired token', 401);
  }

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  console.error('ERROR 💥', err.stack);
  res.status(500).json({
    error: 'Something went wrong, please try again later'
  });
};

export default errorHandler;
