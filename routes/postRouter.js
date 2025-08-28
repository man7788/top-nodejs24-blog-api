const { Router } = require('express');
const passport = require('passport');

const postController = require('../controllers/postController');

const postRouter = Router();

postRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  postController.postBlogPost,
);

module.exports = postRouter;
