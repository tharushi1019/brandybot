const User = require('../models/User');
const { catchAsync } = require('../utils/errorHandler'); // We need to add catchAsync to utils
const { AppError } = require('../utils/AppError');

/**
 * Sync User
 * Creates or updates user in MongoDB after Firebase login
 * Route: POST /api/auth/sync
 */
exports.syncUser = async (req, res, next) => {
    try {
        // User is already attached to req by protect middleware
        // We just need to update any changed details from the body or token

        const { displayName, photoURL } = req.body;
        const user = req.user;

        // Update fields if provided
        if (displayName) user.displayName = displayName;
        if (photoURL) user.photoURL = photoURL;

        // Update last login
        await user.updateLastLogin();

        res.status(200).json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Current User
 * Route: GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        next(error);
    }
};
