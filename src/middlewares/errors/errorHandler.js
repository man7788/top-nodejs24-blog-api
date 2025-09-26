const errorHandler = (err, req, res, next) => {
  // Log the error for internal debugging and monitoring
  console.error(err);

  // Determine the status code and message
  let statusCode = err.statusCode || 500;
  let message;

  if (statusCode < 500) {
    message = err.message || 'Client Error';
  } else {
    message = err.message || 'Internal Server Error';
  }

  // Customize error response based on error type or environment
  if (process.env.NODE_ENV === 'production') {
    // In production, provide generic messages for unhandled errors
    if (statusCode === 500) {
      message = 'Internal server error. Something went wrong at our end.';
    }
  }

  // Send the error response to the client
  res.status(statusCode).json({
    status: 'error',
    error: {
      code: statusCode,
      message: message,
    },
  });
};

module.exports = { errorHandler };
