require('dotenv').config();
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('../../prisma/queries/userQuery');

// Convert public key from pem to base64 format
const publicKey = Buffer.from(process.env.JWT_PUB_KEY, 'base64').toString(
  'ascii'
);

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: publicKey,
};

const verifyCallback = async (jwt_payload, done) => {
  try {
    const user = await db.readUserById(jwt_payload.sub);

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
};

passport.use(new JwtStrategy(options, verifyCallback));
