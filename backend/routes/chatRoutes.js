const express = require('express');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.post('/message', chatController.sendMessage);

module.exports = router;
