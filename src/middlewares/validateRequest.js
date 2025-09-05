const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Collect all validation errors
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));

    return res
      .status(400)
      .json(new ApiError(400, "Validation failed", extractedErrors));
  }

  next();
};

module.exports = validateRequest;
