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

router.route('/:cameraId/start').post(userAuth, cameraController.startCamera);
router.route('/:cameraId/stop').post(userAuth, cameraController.stopCamera);

module.exports = router;