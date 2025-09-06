const Alert = require('../../models/Alert');
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

/**
 *
 * @param {*} req entranceId, title, message, severity, isResolved, resolvedAt, triggeredBy
 * @param {*} res new alert
 * @returns success on registering alert
 */
exports.registerAlert = asyncHandler(async (req, res) => {
    const { entranceId, title, message, severity, isResolved, resolvedAt, triggeredBy } = req.body;
    const alert = new Alert({
        entranceId,
        title,
        message,
        severity,
        triggeredBy,
        isResolved,
        resolvedAt
    });

    await alert.save();

    // Emit Socket.IO event to the specific entrance room AND to a global channel
    const io = req.app.get('io');
    if (io) {
        // Emit to the specific entrance (for entrance-specific components)
        io.to(entranceId.toString()).emit('newAlert', {
            _id: alert._id,
            title: alert.title,
            message: alert.message,
            severity: alert.severity,
            createdAt: alert.createdAt,
            entranceId: alert.entranceId
        });

        // ALSO emit to a global channel for admin users
        io.emit('globalAlert', {
            _id: alert._id,
            title: alert.title,
            message: alert.message,
            severity: alert.severity,
            createdAt: alert.createdAt,
            entranceId: alert.entranceId
        });
    }

    res.status(200).json(new ApiResponse(200, alert, 'Alert registered successfully'));
});

/**
 *
 * @param {*} req alertId, entranceId, title, message, severity, isResolved, resolvedAt, triggeredBy
 * @param {*} res updated alert
 * @returns success on updating alert
 */
exports.updateAlert = asyncHandler(async (req, res) => {
    const { alertId, entranceId, title, message, severity, isResolved, resolvedAt, triggeredBy } = req.body;
    const alert = await Alert.findById(alertId);
    if (!alert) {
        return res.status(400).json(new ApiError(400, 'Alert not found'));
    }

    alert.entranceId = entranceId;
    alert.title = title;
    alert.message = message;
    alert.severity = severity;
    alert.isResolved = isResolved;
    alert.resolvedAt = resolvedAt;
    alert.triggeredBy = triggeredBy;

    await alert.save();
    res.status(200).json(new ApiResponse(200, alert, 'Alert updated successfully'));
});

/**
 *
 * @param {*} req alertId
 * @param {*} res deleted alert
 * @returns success on deleting alert
 */
exports.deleteAlert = asyncHandler(async (req, res) => {
    const { alertId } = req.params;
    const alert = await Alert.findById(alertId);
    if (!alert) {
        return res.status(400).json(new ApiError(400, 'Alert not found'));
    }

    alert.isDeleted = true;
    await alert.save();
    res.status(200).json(new ApiResponse(200, alert, 'Alert deleted successfully'));
});

/**
 *
 * @param {*} req
 * @param {*} res all alerts
 * @returns success on getting all alerts
 */
exports.getAllAlerts = asyncHandler(async (req, res) => {
    try {
        const { page, limit, entranceId, isDeleted, isResolved, isRead } = req.query;

        // Build query object
        const query = {};

        if (entranceId) {
            query.entranceId = entranceId;
        }

        if (isResolved !== undefined) {
            query.isResolved = isResolved === 'true';
        }

        // Handle isDeleted filter (supporting both true/false and missing documents)
        if (isDeleted === "true") {
            query.isDeleted = true;
        } else {
            query["$or"] = [{ isDeleted: false }, { isDeleted: { $exists: false } }];
        }

        if (isRead) {
            query.isRead = isRead === true;
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
                        { $limit: requestedLimit },
                        {
                            $project: {
                                _id: 1,
                                entranceId: 1,
                                title: 1,
                                message: 1,
                                triggeredBy: 1,
                                severity: 1,
                                isResolved: 1,
                                resolvedAt: 1,
                                isRead: 1,
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

        const result = await Alert.aggregate(pipeline);

        res.status(200).json(new ApiResponse(200, result[0], 'Alerts fetched successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, error, 'Error fetching alerts'));
    }
});

/**
 *
 * @param {*} req alertId
 * @param {*} res alert
 * @returns success on getting alert
 */
exports.getAlert = asyncHandler(async (req, res) => {
    const { alertId } = req.params;
    const alert = await Alert.findById(alertId);
    if (!alert) {
        return res.status(400).json(new ApiError(400, 'Alert not found'));
    }
    res.status(200).json(new ApiResponse(200, alert, 'Alert fetched successfully'));
});

/**
 *
 * @param {*} req alertId
 * @param {*} res restore alert
 * @returns success on restoring alert
 */
exports.restoreAlert = asyncHandler(async (req, res) => {
    const { alertId } = req.params;
    const alert = await Alert.findById(alertId);
    if (!alert) {
        return res.status(400).json(new ApiError(400, 'Alert not found'));
    }

    alert.isDeleted = false;
    await alert.save();
    res.status(200).json(new ApiResponse(200, alert, 'Alert restored successfully'));
});


/**
 * Mark all unread alerts as read for a specific entrance
 * @param {*} req entranceId in body
 * @param {*} res success message
 * @returns confirmation of updated alerts
 */
exports.markAllAlertsAsRead = asyncHandler(async (req, res) => {
    const result = await Alert.updateMany(
        {
            isRead: false,
            $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
        },
        { $set: { isRead: true } }
    );

    res.status(200).json(new ApiResponse(200, result, 'All alerts marked as read successfully'));
});

/**
 * Get list of unread alerts for a specific entrance
 * @param {*} req entranceId as query parameter
 * @param {*} res list of unread alerts
 * @returns array of unread alerts
 */
exports.getUnreadAlerts = asyncHandler(async (req, res) => {
    const { entranceId } = req.query;

    if (!entranceId) {
        return res.status(400).json(new ApiError(400, 'Entrance ID is required'));
    }

    const alerts = await Alert.find({
        entranceId,
        isRead: false,
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
    }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, alerts, 'Unread alerts fetched successfully'));
});