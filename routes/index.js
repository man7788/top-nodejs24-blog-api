const auth = require('./authRouter');
const post = require('./postRouter');
const comment = require('./commentRouter');

const notFound = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 404,
      message: 'Page not found',
    },
  });
};

// Barrel file exports
module.exports = {
  auth,
  post,
  comment,
  notFound,
};
