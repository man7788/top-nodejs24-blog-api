const { body } = require('express-validator');

const emptyErr = 'must not be empty.';
const formatErr = 'format is not correct.';
const lengthErr64 = 'must not must not exceed 64 characters.';
const lengthErr255 = 'must not must not exceed 255 characters.';

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(`Email ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Email ${lengthErr255}`)
    .bail()
    .isEmail()
    .withMessage(`Email ${formatErr}`)
    .escape(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage(`Password ${emptyErr}`)
    .bail()
    .isLength({ max: 64 })
    .withMessage(`Password ${lengthErr64}`)
    .escape(),
];

exports.validateProfile = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isLength({ max: 64 })
    .withMessage(`Name ${lengthErr64}`)
    .escape(),
];

exports.validatePassword = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage(`Current password ${emptyErr}`)
    .bail()
    .isLength({ max: 64 })
    .withMessage(`Current password ${lengthErr64}`)
    .escape(),
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage(`New password ${emptyErr}`)
    .bail()
    .isLength({ max: 64 })
    .withMessage(`New password ${lengthErr64}`)
    .escape(),
  body('passwordConfirmation')
    .trim()
    .notEmpty()
    .withMessage(`Password confirmation ${emptyErr}`)
    .bail()
    .isLength({ max: 64 })
    .withMessage(`Password confirmation ${lengthErr64}`)
    .bail()
    .custom((value, { req }) => {
      return value === req.body.newPassword;
    })
    .withMessage(`Passwords do not match`)
    .escape(),
];
