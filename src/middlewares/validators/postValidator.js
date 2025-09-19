const { body } = require('express-validator');

const emptyErr = 'must not be empty.';
const booleanErr = 'must be a boolean value.';
const lengthErr255 = 'must not exceed 255 characters.';

exports.validatePost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(`Title ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Title ${lengthErr255}`)
    .escape(),
  body('content')
    .trim()
    .notEmpty()
    .withMessage(`Content ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Content ${lengthErr255}`)
    .escape(),
];

exports.validatePatch = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(`Title ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Title ${lengthErr255}`)
    .escape(),
  body('content')
    .trim()
    .notEmpty()
    .withMessage(`Content ${emptyErr}`)
    .bail()
    .isLength({ max: 255 })
    .withMessage(`Content ${lengthErr255}`)
    .escape(),
  body('published')
    .isBoolean()
    .withMessage(`Published ${booleanErr}`)
    .optional(),
];
