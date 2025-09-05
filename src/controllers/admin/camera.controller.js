const Camera = require('../../models/Camera');
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const { ObjectId } = require('mongoose');

/**
 *
 * @param {*} req name, description, thresholdMedium, thresholdHigh
 * @param {*} res new camera
 * @returns success on registering camera
 */
exports.registerCamera = asyncHandler(async (req, res) => {
    const { entranceId, deviceId, name, streamUrl, roi, isActive, ipAddress, location } = req.body;
    const camera = new Camera({
        entranceId,
        deviceId,
        name,
        streamUrl,
        roi,
        isActive,
        ipAddress,
        location
    });
    await camera.save();
    res.status(200).json(new ApiResponse(200, camera, 'Camera registered successfully'));
});

/**
 *
 * @param {*} req entranceId, deviceId, name, streamUrl, roi, isActive, ipAddress, location
 * @param {*} res updated camera
 * @returns success on updating camera
 */
exports.updateCamera = asyncHandler(async (req, res) => {
    const { cameraId } = req.params;
    const { entranceId, deviceId, name, streamUrl, roi, isActive, ipAddress, location } = req.body;
    const camera = await Camera.findById(cameraId);
    if (!camera) {
        return res.status(400).json(new ApiError(400, 'Camera not found'));
    }

    camera.entranceId = entranceId;
    camera.deviceId = deviceId;
    camera.name = name;
    camera.streamUrl = streamUrl;
    camera.roi = roi;
    camera.isActive = isActive;
    camera.ipAddress = ipAddress;

    await camera.save();
    res.status(200).json(new ApiResponse(200, camera, 'Camera updated successfully'));
});

/**
 *
 * @param {*} req cameraId
 * @param {*} res deleted camera
 * @returns success on deleting camera
 */
exports.deleteCamera = asyncHandler(async (req, res) => {
    const { cameraId } = req.params;
    const camera = await Camera.findById(cameraId);
    if (!camera) {
        return res.status(400).json(new ApiError(400, 'Camera not found'));
    }

    camera.isDeleted = true;
    await camera.save();
    res.status(200).json(new ApiResponse(200, camera, 'Camera deleted successfully'));
});

/**
 *
 * @param {*} req
 * @param {*} res all cameras
 * @returns success on getting all cameras
 */
exports.getAllCameras = asyncHandler(async (req, res) => {
    try {
        const { page, limit, location, entranceId, isActive } = req.query;

        // Build query object
        const query = {};

        if (location) {
            query.location = location;
        }

        if (entranceId) {
            query.entranceId = new mongoose.Types.ObjectId(entranceId);
        }

        if (isActive) {
            query.isActive = isActive === 'true';
        }

        // Parse pagination parameters with defaults
        const requestedPage = Math.max(1, parseInt(page) || 1);
        const requestedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Cap limit to 100

        // Create aggregation pipeline
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'entrances',
                    localField: 'entranceId',
                    foreignField: '_id',
                    as: 'entrance'
                }
            },
            { $unwind: { path: '$entrance', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'detections',
                    let: { camId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$cameraId', '$$camId'] } } },
                        { $sort: { timestamp: -1 } }, // latest detection first
                        { $limit: 1 },
                        {
                            $project: {
                                _id: 1,
                                count: 1,
                                density: 1,
                                imageSnapshot: 1,
                                timestamp: 1,
                                entranceId: 1
                            }
                        }
                    ],
                    as: 'latestDetection'
                }
            },
            { $unwind: { path: '$latestDetection', preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    metadata: [
                        { $count: 'total_results' },
                        {
                            $addFields: {
                                page: requestedPage,
                                limit: requestedLimit,
                                total_pages: {
                                    $ceil: { $divide: ['$total_results', requestedLimit] }
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
                                deviceId: 1,
                                name: 1,
                                streamUrl: 1,
                                roi: 1,
                                isActive: 1,
                                ipAddress: 1,
                                location: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                entrance: {
                                    _id: 1,
                                    name: 1,
                                    description: 1,
                                    thresholdMedium: 1,
                                    thresholdHigh: 1,
                                    isActive: 1,
                                    location: 1
                                },
                                latestDetection: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    metadata: {
                        $cond: {
                            if: { $gt: [{ $size: '$metadata' }, 0] },
                            then: { $arrayElemAt: ['$metadata', 0] },
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

        const result = await Camera.aggregate(pipeline);

        res.status(200).json(new ApiResponse(200, result[0], 'Cameras fetched successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, error, 'Error fetching cameras'));
    }
});


/**
 *
 * @param {*} req cameraId
 * @param {*} res camera
 * @returns success on getting camera
 */
exports.getCamera = asyncHandler(async (req, res) => {
    const { cameraId } = req.params;
    const camera = await Camera.findById(cameraId);
    if (!camera) {
        return res.status(400).json(new ApiError(400, 'Camera not found'));
    }
    res.status(200).json(new ApiResponse(200, camera, 'Camera fetched successfully'));
});

/**
 *
 * @param {*} req cameraId
 * @param {*} res restore camera
 * @returns success on restoring camera
 */
exports.restoreCamera = asyncHandler(async (req, res) => {
    const { cameraId } = req.params;
    const camera = await Camera.findById(cameraId);
    if (!camera) {
        return res.status(400).json(new ApiError(400, 'Camera not found'));
    }

    camera.isDeleted = false;
    await camera.save();
    res.status(200).json(new ApiResponse(200, camera, 'Camera restored successfully'));

});

