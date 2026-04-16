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
    res.status(200).json({ success: true, data: req.user });
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
        updates.preferences = sql.json({ ...user.preferences, ...preferences });
    }

    if (Object.keys(updates).length > 0) {
        const [updatedUser] = await sql`
            UPDATE users SET ${sql(updates, Object.keys(updates))}
            WHERE id = ${user.id}
            RETURNING *
        `;
        if (updatedUser) Object.assign(user, updatedUser);
    }

    res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Get AI preferences for current user
 * @route   GET /api/users/preferences
 * @access  Private
 */
exports.getPreferences = catchAsync(async (req, res, next) => {
    const prefs = req.user.preferences || {};
    res.status(200).json({
        success: true,
        data: {
            defaultStyle: prefs.defaultStyle || 'Modern',
            defaultIndustry: prefs.defaultIndustry || 'Technology',
            aiPrefsEnabled: prefs.aiPrefsEnabled !== false,
        }
    });
});

/**
 * @desc    Save AI preferences for current user
 * @route   PATCH /api/users/preferences
 * @access  Private
 */
exports.savePreferences = catchAsync(async (req, res, next) => {
    const { defaultStyle, defaultIndustry, aiPrefsEnabled } = req.body;
    const currentPrefs = req.user.preferences || {};

    const updatedPrefs = {
        ...currentPrefs,
        ...(defaultStyle !== undefined ? { defaultStyle } : {}),
        ...(defaultIndustry !== undefined ? { defaultIndustry } : {}),
        ...(aiPrefsEnabled !== undefined ? { aiPrefsEnabled } : {}),
    };

    const [user] = await sql`
        UPDATE users SET preferences = ${sql.json(updatedPrefs)}
        WHERE id = ${req.user.id}
        RETURNING preferences
    `;

    res.status(200).json({
        success: true,
        data: user?.preferences || updatedPrefs
    });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
exports.deleteAccount = catchAsync(async (req, res, next) => {
    const user = req.user;

    try {
        await admin.auth().deleteUser(user.uid);
    } catch (error) {
        console.error('Firebase user deletion failed:', error);
    }

    await sql`DELETE FROM users WHERE id = ${user.id}`;
    console.log(`Successfully deleted user ${user.id} and all related data via CASCADE.`);

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
});
