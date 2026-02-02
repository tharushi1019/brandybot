const admin = require('firebase-admin');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');

/**
 * Authentication Middleware
 * Verifies Firebase ID Token and appends user to request object
 */
const protect = async (req, res, next) => {
    let token;

    // 1) Getting token from headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        // 2) Verification token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 3) Check if user exists in our DB, if not sync them (Upsert)
        // This ensures that even if the sync endpoint wasn't called, we have the user
        let user = await User.findByUid(decodedToken.uid);

        if (!user) {
            // Create basic user profile from token info
            user = await User.create({
                uid: decodedToken.uid,
                email: decodedToken.email,
                displayName: decodedToken.name || '',
                photoURL: decodedToken.picture || '',
                provider: decodedToken.firebase.sign_in_provider || 'unknown'
            });
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = user;
        req.firebaseUser = decodedToken;
        next();

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }
};

/**
 * Restrict to certain roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

module.exports = { protect, restrictTo };
