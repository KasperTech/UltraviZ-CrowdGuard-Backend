
const ApiError = require('../utils/apiError.js')

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    } else {
        // console.log("Server Error: ", err);
        res.status(500).json({
            success: false,
            message: err?.message || "Error Handler: Some internal server error",
        });
    }
};

module.exports = errorHandler