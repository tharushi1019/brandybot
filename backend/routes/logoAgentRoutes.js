const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { sendAgentMessage, sendGuestMessage } = require('../controllers/logoAgentController');

// Guest route — no auth required but rate limited
router.post('/guest-message', apiLimiter, sendGuestMessage);

// Protected routes
router.use(protect);
router.use(apiLimiter);

router.post('/message', sendAgentMessage);

module.exports = router;
