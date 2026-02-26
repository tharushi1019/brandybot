const { sql } = require('../config/db');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');

/**
 * Sync User
 * Creates or updates user in Database after Firebase login
 * Route: POST /api/auth/sync
 */
exports.syncUser = catchAsync(async (req, res, next) => {
    const { displayName, photoURL } = req.body;
    const user = req.user;

    const updates = {};
    if (displayName && user.display_name !== displayName) {
        updates.display_name = displayName;
    }
    if (photoURL && user.photo_url !== photoURL) {
        updates.photo_url = photoURL;
    }

    // Always update last_login
    updates.last_login = sql`NOW()`;

    const [updatedUser] = await sql`
        UPDATE users SET ${sql(updates, Object.keys(updates))}
        WHERE id = ${user.id}
        RETURNING *
    `;

    if (updatedUser) {
        req.user = updatedUser;
    }

    res.status(200).json({
        success: true,
        data: {
            user: req.user
        }
    });
});

/**
 * Get Current User
 * Route: GET /api/auth/me
 */
exports.getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user
        }
    });
});
