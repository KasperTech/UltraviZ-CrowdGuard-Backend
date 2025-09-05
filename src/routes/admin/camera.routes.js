const express = require('express');
const cameraController = require('../../controllers/admin/camera.controller');
const userAuth = require('../../middlewares/userAuthentication.middleware');

const router = express.Router();

router
    .route('/')
    .get(userAuth, cameraController.getAllCameras)
    .post(userAuth, cameraController.registerCamera);

router
    .route('/:cameraId')
    .get(userAuth, cameraController.getCamera)
    .put(userAuth, cameraController.updateCamera)
    .delete(userAuth, cameraController.deleteCamera)

router
    .route('/:cameraId/restore')
    .put(userAuth, cameraController.restoreCamera);

module.exports = router;