const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const postValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 500 })
    .withMessage('Post content cannot exceed 500 characters'),
  handleValidationErrors,
];

const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 200 })
    .withMessage('Comment cannot exceed 200 characters'),
  handleValidationErrors,
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('avatar')
    .optional()
    .trim(),
  handleValidationErrors,
];

const objectIdParam = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  postValidation,
  commentValidation,
  updateProfileValidation,
  objectIdParam,
  handleValidationErrors,
};
