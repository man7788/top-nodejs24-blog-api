const auth = require('./authRouter');
const post = require('./postRouter');
const comment = require('./commentRouter');
const notFound = require('../middlewares/errors/routeNotFound');

// Barrel file exports
module.exports = {
  auth,
  post,
  comment,
  notFound,
};
