const asyncHandler = require("../../middlewares/asyncHandler");
const Camera = require("../../models/Camera");
const ApiResponse = require("../../utils/apiResponse");

exports.fetchCameraLocation = asyncHandler(async (req, res) => {
  const data = await Camera.find({ isActive: true }).select(
    "location name threshold enteranceId"
  ).populate('entranceId', 'name');

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Camera fetched successfully"));
});
