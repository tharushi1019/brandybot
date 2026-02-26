const { sql } = require('../config/db');
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

    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;

    if (preferences) {
        // Merge existing JSONB preferences with new preferences
        updates.preferences = { ...user.preferences, ...preferences };
    }

    if (Object.keys(updates).length > 0) {
        const [updatedUser] = await sql`
            UPDATE users SET ${sql(updates, Object.keys(updates))}
            WHERE id = ${user.id}
            RETURNING *
        `;
        if (updatedUser) Object.assign(user, updatedUser);
    }

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
    }

    // 2. Delete from PostgreSQL
    // ON DELETE CASCADE automatically sweeps out their brands and logo_history
    await sql`DELETE FROM users WHERE id = ${user.id}`;

    console.log(`Successfully deleted user ${user.id} and all related data via CASCADE.`);

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
    });
});
