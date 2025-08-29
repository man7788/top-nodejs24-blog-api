const auth = require('./authRouter');
const post = require('./postRouter');
const comment = require('./commentRouter');

// Barrel file exports
module.exports = {
  auth,
  post,
  comment,
};
