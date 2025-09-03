const express = require('express');
const { serverHealthCheck } = require('../../controllers/serverTest/serverTest.controller');
const router = express.Router();



router.route('/health').get(serverHealthCheck)

module.exports = router