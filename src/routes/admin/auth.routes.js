const express = require('express');
const authController = require('../../controllers/admin/auth.controller');
const authValidator = require('../../validator/auth.validator');
const validateRequest = require('../../middlewares/validateRequest');

const router = express.Router();

router
    .route('/register')
    .post(authController.registerUser);
router
    .route('/login')
    .post(authController.loginUser);


module.exports = router;