const express = require('express');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ── Public route — guest branding Q&A (no auth required) ──
router.post('/guest-message', apiLimiter, chatController.guestMessage);

// ── Protected routes — need login ──
router.use(protect);
router.use(apiLimiter);

router.post('/message', chatController.sendMessage);
router.post('/save-guest-session', chatController.saveGuestSession);

module.exports = router;

