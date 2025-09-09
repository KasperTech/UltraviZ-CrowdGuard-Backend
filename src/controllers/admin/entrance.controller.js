const Entrance = require('../../models/Entrance');
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

/**
 *
 * @param {*} req name, description, thresholdMedium, thresholdHigh
 * @param {*} res new entrance
 * @returns success on registering entrance
 */
exports.registerEntrance = asyncHandler(async (req, res) => {
    const { name, description, isActive } = req.body; 
    const entrance = new Entrance({
        name,
        description,
        isActive,
    });
    await entrance.save();
    res.status(200).json(new ApiResponse(200, entrance, 'Entrance registered successfully'));
});

/**
 *
 * @param {*} req entranceId, name, description, thresholdMedium, thresholdHigh
 * @param {*} res updated entrance
 * @returns success on updating entrance
 */
exports.updateEntrance = asyncHandler(async (req, res) => {
    const { entranceId } = req.params;
    const { name, description, isActive } = req.body;
    const entrance = await Entrance.findById(entranceId);
    if (!entrance) {
        return res.status(400).json(new ApiError(400, 'Entrance not found'));
    }

    entrance.name = name;
    entrance.description = description;
    entrance.isActive = isActive;

    await entrance.save();
    res.status(200).json(new ApiResponse(200, entrance, 'Entrance updated successfully'));
});

/**
 *
 * @param {*} req entranceId
 * @param {*} res deleted entrance
 * @returns success on deleting entrance
 */
exports.deleteEntrance = asyncHandler(async (req, res) => {
    const { entranceId } = req.params;
    const entrance = await Entrance.findById(entranceId);
    if (!entrance) {
        return res.status(400).json(new ApiError(400, 'Entrance not found'));
    }

    entrance.isDeleted = true;
    await entrance.save();
    res.status(200).json(new ApiResponse(200, entrance, 'Entrance deleted successfully'));
});

/**
 *
 * @param {*} req
 * @param {*} res all entrances
 * @returns success on getting all entrances
 */
exports.getAllEntrances = asyncHandler(async (req, res) => {
    try {
        const { page, limit, isDeleted } = req.query;

        // Build query object
        const query = {};
        // Handle isDeleted filter (supporting both true/false and missing documents)
        if (isDeleted === "true") {
            query.isDeleted = true;
        } else {
            query["$or"] = [{ isDeleted: false }, { isDeleted: { $exists: false } }];
        }

        // Parse pagination parameters with defaults
        const requestedPage = Math.max(1, parseInt(page) || 1);
        const requestedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Cap limit to 100

        // Create aggregation pipeline
        const pipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } },
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

        const result = await Entrance.aggregate(pipeline);

        res.status(200).json(new ApiResponse(200, result[0], 'Entrances fetched successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, error, 'Error fetching entrances'));
    }
});

/**
 *
 * @param {*} req entranceId
 * @param {*} res entrance
 * @returns success on getting entrance
 */
exports.getEntrance = asyncHandler(async (req, res) => {
    const { entranceId } = req.params;
    const entrance = await Entrance.findById(entranceId);
    if (!entrance) {
        return res.status(400).json(new ApiError(400, 'Entrance not found'));
    }
    res.status(200).json(new ApiResponse(200, entrance, 'Entrance fetched successfully'));
});

/**
 *
 * @param {*} req entranceId
 * @param {*} res restore entrance
 * @returns success on restoring entrance
 */
exports.restoreEntrance = asyncHandler(async (req, res) => {
    const { entranceId } = req.params;
    const entrance = await Entrance.findById(entranceId);
    if (!entrance) {
        return res.status(400).json(new ApiError(400, 'Entrance not found'));
    }

    entrance.isDeleted = false;
    await entrance.save();
    res.status(200).json(new ApiResponse(200, entrance, 'Entrance restored successfully'));
});

