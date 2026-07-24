const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
      requestId: req.id,
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts', code: 'RATE_LIMITED' },
});

const weatherLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Weather API rate limit exceeded', code: 'RATE_LIMITED' },
});

module.exports = { globalLimiter, authLimiter, weatherLimiter };
