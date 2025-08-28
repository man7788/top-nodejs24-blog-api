require('dotenv').config();
const validator = require('../utils/validators/authValidator');
const { validationResult } = require('express-validator');
const db = require('../database/queries/userQuery');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.postLogin = [
  validator.validateLogin,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorArray = errors.array();
      const resMessage = [
        {
          path: errorArray[0].path,
          message: errorArray[0].msg,
        },
      ];

      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          messages: resMessage,
        },
      });
    }

    const email = req.body.email;
    const password = req.body.password;

    const loginFail = {
      success: false,
      error: {
        code: 401,
        message: 'Incorrect username or password.',
      },
    };

    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.status(404).json(loginFail);
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(404).json(loginFail);
    }

    const payload = { sub: user.id, username: user.username, admin: true };
    const privateKey = Buffer.from(process.env.JWT_PRIV_KEY, 'base64').toString(
      'ascii'
    );

    const token = jwt.sign(payload, privateKey, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
      algorithm: 'RS256',
    });

    res.json({ success: true, token });
  },
];
