const express = require("express");
const router = express.Router({ mergeParams: true });

const cameraRoutes = require("./camera.routes");


router.use("/camera", cameraRoutes);


module.exports = router;