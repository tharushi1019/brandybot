const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All auth routes are protected and rate limited
router.use(protect);
router.use(authLimiter); // Stricter rate limit for auth endpoints

// Sync user data after Firebase login
router.post('/sync', authController.syncUser);

// Get current user profile
router.get('/me', authController.getMe);

module.exports = router;
