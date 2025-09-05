const express = require('express');
const userController = require('../../controllers/admin/user.controller');
const userValidator = require('../../validator/user.validator');
const validateRequest = require('../../middlewares/validateRequest');
const userAuth = require('../../middlewares/userAuthentication.middleware');

const router = express.Router();

router
    .route('/')
    .get(userAuth, userController.getUserList);
router
    .route('/:userId')
    .get(userAuth, userController.getUserDetails)
    .put(userAuth, userController.updateUser)
    .delete(userAuth, userController.deleteUser);
router
    .route('/:userId/restore')
    .put(userAuth, userController.restoreUser);

module.exports = router;