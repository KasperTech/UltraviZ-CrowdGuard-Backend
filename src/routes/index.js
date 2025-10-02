
const express = require('express');
const router = express.Router();

const serverTestRoutes = require('./serverTest/serverTest.routes');
const admin = require('./admin/index.routes');
const public = require('./public/index.routes');

router.use('/server/test', serverTestRoutes);
router.use('/admin', admin);
router.use('/public', public);

module.exports = router