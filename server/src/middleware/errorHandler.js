const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler Log]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.toString() : 'An unexpected error occurred'
  });
};

module.exports = errorHandler;
