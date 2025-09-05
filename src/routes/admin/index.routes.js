const express = require("express");
const router = express.Router({ mergeParams: true });

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const cameraRoutes = require("./camera.routes");
const entranceRoutes = require("./entrance.routes");
const detectionRoutes = require("./detection.routes");
const alertRoutes = require("./alert.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/camera", cameraRoutes);
router.use("/entrance", entranceRoutes);
router.use("/detection", detectionRoutes);
router.use("/alert", alertRoutes);


module.exports = router;
