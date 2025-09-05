const User = require('../../models/User');
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const jwt = require('jsonwebtoken');

/**
 *
 * @param {*} req name, email, password, phone
 * @param {*} res new user
 * @returns success on registering user
 */
exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNo } = req.body;

    const user = await User.findOne({
        $or: [
            { email: email },
            { phoneNo: phoneNo }
        ]
    });

    if (user) {
        return res.status(400).json(new ApiError(400, 'User already exists'));
    }

    const newUser = new User({
        name,
        email,
        phoneNo,
        password,
        role: 'user'
    });

    await newUser.save();

    res.status(200).json(new ApiResponse(200, newUser, 'User registered successfully'));
});


/**
 *
 * @param {*} req email, password
 * @param {*} res token and user
 * @returns success on login user
 */
exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiError(404, 'User not found'));
    }

    const isAuthorized = await user.checkPassword(password);

    if (!isAuthorized) {
        return res.status(400).json(new ApiError(400, 'Invalid credentials'));
    }
    const token = jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role
    }, process.env.JWT_SECRET, {
        expiresIn:"3d"
    });

    res.status(200).json(new ApiResponse(200, {
        token,
        user
    }, 'User logged in successfully'));
});


