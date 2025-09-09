const User = require('../../models/User');
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

/**
 *
 * @param {*} req userId
 * @param {*} res user details
 * @returns success on getting user details
 */
exports.getUserDetails = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(400).json(new ApiError(400, 'User not found'));
    }

    res.status(200).json(new ApiResponse(200, user, 'User details fetched successfully'));
});


/**
 *
 * @param {*} req userId, password, name, email, phoneNo
 * @param {*} res success on updating user
 * @returns success on updating user
 */
exports.updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { password, name, email, phoneNo } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(400).json(new ApiError(400, 'User not found'));
    }
    if (user.isDeleted) {
        return res.status(400).json(new ApiError(400, 'User is deleted'));
    }
    if (password) {
        user.password = password;
    }
    if (name) {
        user.name = name;
    }
    if (email) {
        user.email = email;
    }
    if (phoneNo) {
        user.phoneNo = phoneNo;
    }
    await user.save();

    res.status(200).json(new ApiResponse(200, user, 'User updated successfully'));
});


/**
 *
 * @param {*} req userId
 * @param {*} res success on deleting user
 * @returns success on deleting user
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(400).json(new ApiError(400, 'User not found'));
    }
    if (user.isDeleted) {
        return res.status(400).json(new ApiError(400, 'User is deleted'));
    }

    user.isDeleted = true;
    await user.save();

    res.status(200).json(new ApiResponse(200, user, 'User deleted successfully'));
});


/**
 *
 * @param {*} req userId
 * @param {*} res success on restoring user
 * @returns success on restoring user
 */
exports.restoreUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(400).json(new ApiError(400, 'User not found'));
    }
    if (!user.isDeleted) {
        return res.status(400).json(new ApiError(400, 'User is not deleted'));
    }

    user.isDeleted = false;
    await user.save();

    res.status(200).json(new ApiResponse(200, user, 'User restored successfully'));
});


/**
 *
 * @param {*} req page, limit, name, email, phoneNo
 * @param {*} res user list
 * @returns success on getting user list
 */
exports.getUserList = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, name, email, phoneNo } = req.query;

        // Build query object
        let query = {};
        if (name) query.name = { $regex: name, $options: 'i' };
        if (email) query.email = { $regex: email, $options: 'i' };
        if (phoneNo) query.phoneNo = { $regex: phoneNo, $options: 'i' };

        // Parse pagination parameters with defaults
        const requestedPage = Math.max(1, parseInt(page));
        const requestedLimit = Math.min(100, Math.max(1, parseInt(limit))); // Cap limit to 100

        // Create aggregation pipeline
        const pipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } }, // Sort by newest first
            {
                $facet: {
                    metadata: [
                        { $count: "total_results" },
                        {
                            $addFields: {
                                page: requestedPage,
                                limit: requestedLimit,
                                total_pages: {
                                    $ceil: { $divide: ["$total_results", requestedLimit] }
                                }
                            }
                        }
                    ],
                    data: [
                        { $skip: (requestedPage - 1) * requestedLimit },
                        { $limit: requestedLimit }
                    ]
                }
            },
            {
                $project: {
                    metadata: {
                        $cond: {
                            if: { $gt: [{ $size: "$metadata" }, 0] },
                            then: { $arrayElemAt: ["$metadata", 0] },
                            else: {
                                total_results: 0,
                                page: requestedPage,
                                limit: requestedLimit,
                                total_pages: 0
                            }
                        }
                    },
                    data: 1
                }
            }
        ];

        const result = await User.aggregate(pipeline);

        res.status(200).json(new ApiResponse(200, result[0], 'User list fetched successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, error, 'Error fetching users'));
    }
});