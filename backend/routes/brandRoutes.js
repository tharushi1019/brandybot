const express = require('express');
const brandController = require('../controllers/brandController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (must be before protect if path conflicts, or separate router)
// But here the path is different: /share-link/:shareLink vs /:id
// Let's keep public route here but check order
router.get('/public/:shareLink', brandController.getPublicBrand);

// Protect all other routes
router.use(protect);
router.use(apiLimiter);

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

module.exports = router;
