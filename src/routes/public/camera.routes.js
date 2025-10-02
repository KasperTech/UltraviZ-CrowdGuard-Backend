const express = require("express");
const {
  fetchCameraLocation,
} = require("../../controllers/public/camera.controller");
const router = express.Router({ mergeParams: true });

router.route("/").get(fetchCameraLocation);

module.exports = router;
