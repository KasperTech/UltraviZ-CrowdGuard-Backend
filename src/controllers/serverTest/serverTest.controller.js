const asyncHandler = require("../../middlewares/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");

exports.serverHealthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, "Sever working well"))
})