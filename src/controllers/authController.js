require('dotenv').config();
const validator = require('../middlewares/validators/authValidator');
const { validationResult } = require('express-validator');
const ErrorFormatter = require('../utils/formatters/errorFormatter');
const db = require('../services/queries/userQuery');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Handle authentication and sign JWT on POST
exports.postLogin = [
  validator.validateLogin,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const details = new ErrorFormatter(errors).array();

      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Login form validation failed.',
          details,
        },
      });
    }

    const email = req.body.email;
    const password = req.body.password;

    // Generic phrase response for invalid email and password
    const loginFail = {
      status: 'error',
      error: {
        code: 401,
        message: 'Invalid email or password.',
        details: [{ field: 'generic', message: 'Invalid email or password.' }],
      },
    };

    const user = await db.readUserByEmail(email);

    if (!user) {
      return res.status(401).json(loginFail);
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json(loginFail);
    }

    // Payload for JWT sign
    const payload = {
      sub: user.id,
      user: user.name,
      admin: user.admin,
    };

    // Convert private key from pem to base64 format
    const privateKey = Buffer.from(process.env.JWT_PRIV_KEY, 'base64').toString(
      'ascii',
    );

    const token = jwt.sign(payload, privateKey, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
      algorithm: 'RS256',
    });

    res.status(200).json({ status: 'success', data: { token } });
  },
];
