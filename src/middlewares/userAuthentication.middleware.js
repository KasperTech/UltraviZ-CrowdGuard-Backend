const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");

const userAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null || token === "")
      return res.status(400).json(new ApiError(400, "Unauthorized"));

    //get user's data from token
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user) {
      req.user = user._id;
      req.token = token;
    }
    next();
});

module.exports = userAuth;
