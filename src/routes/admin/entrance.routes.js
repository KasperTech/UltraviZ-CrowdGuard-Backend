const express = require('express');
const entranceController = require('../../controllers/admin/entrance.controller');
const userAuth = require('../../middlewares/userAuthentication.middleware');

const router = express.Router();

router
    .route('/')
    .get(userAuth, entranceController.getAllEntrances)
    .post(userAuth, entranceController.registerEntrance);

router
    .route('/:entranceId')
    .get(userAuth, entranceController.getEntrance)
    .put(userAuth, entranceController.updateEntrance)
    .delete(userAuth, entranceController.deleteEntrance)

router
    .route('/:entranceId/restore')
    .put(userAuth, entranceController.restoreEntrance);

module.exports = router;
