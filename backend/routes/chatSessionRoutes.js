const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const cs = require('../controllers/chatSessionController');

router.use(protect);
router.use(apiLimiter);

// Session management
router.get('/sessions', cs.getSessions);
router.post('/sessions', cs.createSession);
router.get('/sessions/:id', cs.getSessionById);
router.patch('/sessions/:id', cs.updateSession);
router.delete('/sessions/:id', cs.deleteSession);

// Messages within a session
router.post('/sessions/:id/message', cs.addMessage);

module.exports = router;
