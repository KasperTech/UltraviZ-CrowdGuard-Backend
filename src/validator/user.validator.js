const { body, param, query } = require("express-validator");

//  Validate :id in params
const userIdParam = [
  param("userId")
    .trim()
    .notEmpty().withMessage("User ID is required")
    .isMongoId().withMessage("Invalid User ID format"),
];

//  GET /user/:userId
exports.getUserDetailsValidator = [...userIdParam];

//  PUT /user/:userId
exports.updateUserValidator = [
  ...userIdParam,

  body("password")
    .optional()
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Invalid email format"),

  body("phoneNo")
    .optional()
    .isMobilePhone().withMessage("Invalid phone number"),
];

//  DELETE /user/:userId
exports.deleteUserValidator = [...userIdParam];

//  PATCH /user/:userId/restore
exports.restoreUserValidator = [...userIdParam];

//  GET /users (list)
exports.getUserListValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  query("name")
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage("Name filter must be at least 2 characters"),

  query("email")
    .optional()
    .trim()
    .isEmail().withMessage("Invalid email format"),

  query("phoneNo")
    .optional()
    .isMobilePhone().withMessage("Invalid phone number"),
];
