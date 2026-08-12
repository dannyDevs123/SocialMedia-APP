const rateLimit = require('express-rate-limit');

const rateLimitMessage = {
  success: false,
  message: 'Too many requests, please try again later',
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

module.exports = {
  apiLimiter,
  authLimiter,
};
