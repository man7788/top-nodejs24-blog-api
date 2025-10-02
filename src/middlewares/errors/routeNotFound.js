const notFound = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 404,
      message: 'Page not found',
    },
  });
};

module.exports = notFound;
