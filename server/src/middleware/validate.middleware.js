const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        ApiError.badRequest(errors.array()[0].msg, 'VALIDATION_ERROR', errors.array())
      );
    }
    next();
  };
}

module.exports = validate;
