const express = require('express');
const { protect } = require('../middleware/auth');
const utilController = require('../controllers/utilController');

const router = express.Router();

// Apply auth middleware to all utility routes
router.use(protect);

router.post('/remove-bg', utilController.removeBackground);

module.exports = router;
