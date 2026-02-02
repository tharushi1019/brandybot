const express = require('express');
const logoController = require('../controllers/logoController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply protection to all logo routes
router.use(protect);

// Apply rate limiting (Logo generation is expensive!)
router.use(apiLimiter);

router.post('/generate', logoController.generateLogo);
router.get('/history', logoController.getLogoHistory);
router.get('/:id', logoController.getLogoById);
router.post('/:id/rate', logoController.rateLogo);

module.exports = router;
