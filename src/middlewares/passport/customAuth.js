const passport = require('passport');

const customJwtAuth = (req, res, next) => {
  // passport.authenticate will return the custom callback (err, user, info) => { ... },
  // which will be called as an IIFE with (req, res, next) functioning as a middleware.
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      // Handle unexpected errors during authentication (e.g., database issues)
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 401,
          message: 'Unauthorized',
          // A message indicating why authentication failed (e.g., "No auth token").
          details: info?.message || 'Invalid or expired token',
        },
      });
    }
    // Authentication successful, attach user to request and proceed
    req.user = user;

    next();
  })(req, res, next);
};

module.exports = { customJwtAuth };

// function (type,opt,cb) {
//
// }
