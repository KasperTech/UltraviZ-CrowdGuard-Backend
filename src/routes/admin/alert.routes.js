const express = require('express');
const alertController = require('../../controllers/admin/alert.controller');
const userAuth = require('../../middlewares/userAuthentication.middleware');

const router = express.Router();

router
    .route('/')
    .get(userAuth, alertController.getAllAlerts)
    .post(userAuth, alertController.registerAlert);

router
    .route('/:alertId')
    .get(userAuth, alertController.getAlert)
    .put(userAuth, alertController.updateAlert)
    .delete(userAuth, alertController.deleteAlert)

router
    .route('/:alertId/restore')
    .put(userAuth, alertController.restoreAlert);

router
    .route('/mark-all-as-read')
    .post(userAuth, alertController.markAllAlertsAsRead);

router
    .route('/:entranceId/unread')
    .get(userAuth, alertController.getUnreadAlerts);

module.exports = router;
