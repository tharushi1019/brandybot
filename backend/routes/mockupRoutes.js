const express = require('express');
const mockupController = require('../controllers/mockupController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.post('/generate', mockupController.generateMockup);
router.get('/templates', mockupController.getMockupTemplates);

module.exports = router;
