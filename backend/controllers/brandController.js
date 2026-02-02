const Brand = require('../models/Brand');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');

/**
 * @desc    Create a new brand
 * @route   POST /api/brands
 * @access  Private
 */
exports.createBrand = catchAsync(async (req, res, next) => {
    const { brandName, tagline, description, industry, logo, guidelines } = req.body;

    if (!brandName) {
        return next(new AppError('Brand name is required', 400));
    }

    const brand = await Brand.create({
        userId: req.user._id,
        brandName,
        tagline,
        description,
        industry,
        logo: logo || { primaryLogoUrl: 'placeholder' }, // Require logo or allow draft without one? Model says required.
        guidelines: guidelines || {},
        lastUpdatedBy: req.user._id
    });

    await req.user.incrementBrandCount();

    res.status(201).json({
        success: true,
        data: brand
    });
});

/**
 * @desc    Get all brands for current user
 * @route   GET /api/brands
 * @access  Private
 */
exports.getUserBrands = catchAsync(async (req, res, next) => {
    const brands = await Brand.findByUserId(req.user._id, req.query.status); // Support filtering by status

    res.status(200).json({
        success: true,
        count: brands.length,
        data: brands
    });
});

/**
 * @desc    Get single brand by ID
 * @route   GET /api/brands/:id
 * @access  Private
 */
exports.getBrandById = catchAsync(async (req, res, next) => {
    const brand = await Brand.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    res.status(200).json({
        success: true,
        data: brand
    });
});

/**
 * @desc    Update brand details
 * @route   PUT /api/brands/:id
 * @access  Private
 */
exports.updateBrand = catchAsync(async (req, res, next) => {
    let brand = await Brand.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    // Update allowed fields
    const {
        brandName, tagline, description, industry, targetAudience,
        logo, guidelines, mockups, assets
    } = req.body;

    // Manual update to trigger pre-save hooks if needed, or use findOneAndUpdate
    // Using object merge for simplicity here
    if (brandName) brand.brandName = brandName;
    if (tagline !== undefined) brand.tagline = tagline;
    if (description !== undefined) brand.description = description;
    if (industry) brand.industry = industry;
    if (targetAudience) brand.targetAudience = targetAudience;
    if (logo) brand.logo = { ...brand.logo, ...logo }; // Deep merge might be better
    if (guidelines) brand.guidelines = guidelines; // Caution: this might replace nested objects
    if (mockups) brand.mockups = mockups;
    if (assets) brand.assets = assets;

    // Increment version
    brand.version += 1;
    brand.lastUpdatedBy = req.user._id;

    await brand.save();

    res.status(200).json({
        success: true,
        data: brand
    });
});

/**
 * @desc    Delete brand
 * @route   DELETE /api/brands/:id
 * @access  Private
 */
exports.deleteBrand = catchAsync(async (req, res, next) => {
    const brand = await Brand.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

/**
 * @desc    Generate public share link
 * @route   POST /api/brands/:id/share
 * @access  Private
 */
exports.generateShareLink = catchAsync(async (req, res, next) => {
    const brand = await Brand.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    await brand.generateShareLink();

    res.status(200).json({
        success: true,
        data: {
            shareLink: brand.shareLink,
            isPublic: brand.isPublic
        }
    });
});

/**
 * @desc    Get public brand by share link
 * @route   GET /api/public/brands/:shareLink
 * @access  Public
 */
exports.getPublicBrand = catchAsync(async (req, res, next) => {
    const brand = await Brand.findByShareLink(req.params.shareLink);

    if (!brand) {
        return next(new AppError('Brand not found or link expired', 404));
    }

    // Return limited public info? Or full structure?
    // For now, return full structure but maybe sanitise internal fields if any
    res.status(200).json({
        success: true,
        data: brand
    });
});
