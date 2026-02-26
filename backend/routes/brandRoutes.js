const express = require('express');
const brandController = require('../controllers/brandController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.get('/public/:shareLink', brandController.getPublicBrand);

// Protect all other routes
router.use(protect);
router.use(apiLimiter);

// ⚠️ STATELESS guidelines endpoint — MUST be before /:id routes
router.post('/guidelines/generate', brandController.generateGuidelinesStateless);

router
    .route('/')
    .post(brandController.createBrand)
    .get(brandController.getUserBrands);

router
    .route('/:id')
    .get(brandController.getBrandById)
    .put(brandController.updateBrand)
    .delete(brandController.deleteBrand);

router.post('/:id/share', brandController.generateShareLink);
router.post('/:id/guidelines', brandController.generateGuidelines);

module.exports = router;

