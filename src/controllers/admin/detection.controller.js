const Detection = require('../../models/Detection');
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

/**
 *
 * @param {*} req cameraId, entranceId, count, timestamp, imageSnapshot, density
 * @param {*} res new detection
 * @returns success on registering detection
 */
exports.registerDetection = asyncHandler(async (req, res) => {
    const { cameraId, entranceId, count, timestamp, imageSnapshot, density } = req.body;

    const detection = new Detection({
        cameraId,
        entranceId,
        count,
        timestamp,
        imageSnapshot,
        density
    });

    await detection.save();
    res.status(200).json(new ApiResponse(200, detection, 'Detection registered successfully'));
});

/**
 *
 * @param {*} req detectionId, name, description, thresholdMedium, thresholdHigh
 * @param {*} res updated detection
 * @returns success on updating detection
 */
exports.updateDetection = asyncHandler(async (req, res) => {
    const { detectionId, cameraId, entranceId, count, timestamp, imageSnapshot, density } = req.body;
    const detection = await Detection.findById(detectionId);
    if (!detection) {
        return res.status(400).json(new ApiError(400, 'Detection not found'));
    }

    detection.cameraId = cameraId;
    detection.entranceId = entranceId;
    detection.count = count;
    detection.timestamp = timestamp;
    detection.imageSnapshot = imageSnapshot;
    detection.density = density;

    await detection.save();
    res.status(200).json(new ApiResponse(200, detection, 'Detection updated successfully'));
});

/**
 *
 * @param {*} req detectionId
 * @param {*} res deleted detection
 * @returns success on deleting detection
 */
exports.deleteDetection = asyncHandler(async (req, res) => {
    const { detectionId } = req.params;
    const detection = await Detection.findById(detectionId);
    if (!detection) {
        return res.status(400).json(new ApiError(400, 'Detection not found'));
    }

    detection.isDeleted = true;
    await detection.save();
    res.status(200).json(new ApiResponse(200, detection, 'Detection deleted successfully'));
});

/**
 *
 * @param {*} req
 * @param {*} res all detections
 * @returns success on getting all detections
 */
exports.getAllDetections = asyncHandler(async (req, res) => {
    try {
        const { page, limit, cameraId, entranceId, isDeleted } = req.query;

        // Build query object
        const query = {};

        if (cameraId) {
            query.cameraId = new mongoose.Types.ObjectId(cameraId);
        }

        if (entranceId) {
            query.entranceId = new mongoose.Types.ObjectId(entranceId);
        }

        // // Date range filtering
        // if (startDate || endDate) {
        //     query.timestamp = {};
        //     if (startDate) {
        //         query.timestamp.$gte = new Date(startDate);
        //     }
        //     if (endDate) {
        //         query.timestamp.$lte = new Date(endDate);
        //     }
        // }

        // Handle isDeleted filter
        if (isDeleted === "true") {
            query.isDeleted = true;
        } else {
            query["$or"] = [{ isDeleted: false }, { isDeleted: { $exists: false } }];
        }

        // Parse pagination parameters with defaults
        const requestedPage = Math.max(1, parseInt(page) || 1);
        const requestedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Cap limit to 100

        // Create aggregation pipeline with lookups for camera and entrance
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'cameras',
                    localField: 'cameraId',
                    foreignField: '_id',
                    as: 'camera'
                }
            },
            { $unwind: { path: '$camera', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'entrances',
                    localField: 'entranceId',
                    foreignField: '_id',
                    as: 'entrance'
                }
            },
            { $unwind: { path: '$entrance', preserveNullAndEmptyArrays: true } },
            { $sort: { timestamp: -1 } },
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
                        { $limit: requestedLimit },
                        {
                            $project: {
                                _id: 1,
                                count: 1,
                                timestamp: 1,
                                imageSnapshot: 1,
                                density: 1,
                                isDeleted: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                camera: {
                                    _id: 1,
                                    deviceId: 1,
                                    name: 1,
                                    streamUrl: 1,
                                    roi: 1,
                                    isActive: 1,
                                    ipAddress: 1,
                                    location: 1
                                },
                                entrance: {
                                    _id: 1,
                                    name: 1,
                                    description: 1,
                                    thresholdMedium: 1,
                                    thresholdHigh: 1,
                                    isActive: 1,
                                    location: 1
                                }
                            }
                        }
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

        const result = await Detection.aggregate(pipeline);

        res.status(200).json(new ApiResponse(200, result[0], 'Detections fetched successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, error, 'Error fetching detections'));
    }
});

/**
 *
 * @param {*} req detectionId
 * @param {*} res detection
 * @returns success on getting detection
 */
exports.getDetection = asyncHandler(async (req, res) => {
    const { detectionId } = req.params;
    const detection = await Detection.findById(detectionId);
    if (!detection) {
        return res.status(400).json(new ApiError(400, 'Detection not found'));
    }
    res.status(200).json(new ApiResponse(200, detection, 'Detection fetched successfully'));
});

/**
 *
 * @param {*} req detectionId
 * @param {*} res restore detection
 * @returns success on restoring detection
 */
exports.restoreDetection = asyncHandler(async (req, res) => {
    const { detectionId } = req.params;
    const detection = await Detection.findById(detectionId);
    if (!detection) {
        return res.status(400).json(new ApiError(400, 'Detection not found'));
    }

    detection.isDeleted = false;
    await detection.save();
    res.status(200).json(new ApiResponse(200, detection, 'Detection restored successfully'));
});

