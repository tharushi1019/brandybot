const User = require('../models/User');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const admin = require('firebase-admin');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = catchAsync(async (req, res, next) => {
    // req.user is already populated by auth protection
    res.status(200).json({
        success: true,
        data: req.user
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
    const { displayName, preferences } = req.body;

    const user = req.user;

    // Update fields
    if (displayName) user.displayName = displayName;

    // Update preferences (merge)
    if (preferences) {
        user.preferences = {
            ...user.preferences,
            ...preferences
        };
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
exports.deleteAccount = catchAsync(async (req, res, next) => {
    const user = req.user;

    // 1. Delete from Firebase Auth
    try {
        await admin.auth().deleteUser(user.uid);
    } catch (error) {
        console.error('Firebase user deletion failed:', error);
        // Continue to delete from DB anyway, or throw error? 
        // Best to continue to ensure data cleanup if possible, or fail if critical.
        // For now, let's log and proceed.
    }

    // 2. Delete from MongoDB
    await User.findByIdAndDelete(user._id);

    // TODO: Clean up related data (Brands, LogoHistory)? 
    // Or keep them for analytics but anonymize? 
    // Mongoose middleware (pre-remove) is better for cascading deletes.

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
    });
});
