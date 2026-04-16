const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { getCredits, getCreditHistory, purchaseCredits } = require('../controllers/creditController');

router.use(protect);
router.use(apiLimiter);

router.get('/', getCredits);
router.get('/history', getCreditHistory);
router.post('/purchase', purchaseCredits);

module.exports = router;
