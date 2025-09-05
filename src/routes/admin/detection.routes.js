const express = require('express');
const detectionController = require('../../controllers/admin/detection.controller');
const userAuth = require('../../middlewares/userAuthentication.middleware');

const router = express.Router();

router
    .route('/')
    .get(userAuth, detectionController.getAllDetections)
    .post(userAuth, detectionController.registerDetection);

router
    .route('/:detectionId')
    .get(userAuth, detectionController.getDetection)
    .put(userAuth, detectionController.updateDetection)
    .delete(userAuth, detectionController.deleteDetection)

router
    .route('/:detectionId/restore')
    .put(userAuth, detectionController.restoreDetection);

module.exports = router;