const LogoHistory = require('../models/LogoHistory');
const User = require('../models/User');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { getConfig } = require('../config/env');

const { generateLogoAI } = require('../services/aiService');

/**
 * @desc    Generate a new logo
 * @route   POST /api/logos/generate
 * @access  Private
 */
exports.generateLogo = catchAsync(async (req, res, next) => {
    const { brandName, prompt, style, industry, colors } = req.body;

    // 1. Validation
    if (!brandName || !prompt) {
        return next(new AppError('Please provide brand name and prompt', 400));
    }

    // 2. Create initial history record (Status: Processing)
    const logoEntry = await LogoHistory.create({
        userId: req.user._id,
        brandName,
        prompt,
        industry,
        style: style || 'modern',
        status: 'processing',
        logoUrl: 'processing...' // Placeholder
    });

    // 3. Call AI Service
    try {
        const aiResult = await generateLogoAI({
            brand_name: brandName,
            prompt,
            style,
            industry,
            colors: colors ? [colors] : []
        });

        // 4. Update history record with results
        // Map Python response to DB format
        logoEntry.logoUrl = aiResult.url;
        // Note: Real AI service currently returns simplified data, so we might need to adjust or mock the extra metadata 
        // until the Python service is fully fleshed out with palette generation.
        // For now, let's keep some defaults if missing from AI response
        logoEntry.colors = {
            primary: colors || '#000000',
            secondary: '#FFFFFF',
            accent: '#CCCCCC',
            additional: []
        };
        logoEntry.fonts = { primary: 'Arial', secondary: 'Helvetica' };

        logoEntry.status = 'completed';
        logoEntry.metadata = aiResult.metadata || {};

        await logoEntry.save();

        // 5. Update user stats
        await req.user.incrementLogoCount();

        res.status(200).json({
            success: true,
            data: logoEntry
        });

    } catch (error) {
        // Handle generation failure
        logoEntry.status = 'failed';
        logoEntry.errorMessage = error.message;
        await logoEntry.save();
        return next(new AppError('Logo generation failed: ' + error.message, 500));
    }
});

/**
 * @desc    Get user's logo history
 * @route   GET /api/logos/history
 * @access  Private
 */
exports.getLogoHistory = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const history = await LogoHistory.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    const total = await LogoHistory.countDocuments({ userId: req.user._id });

    res.status(200).json({
        success: true,
        count: history.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: history
    });
});

/**
 * @desc    Get single logo details
 * @route   GET /api/logos/:id
 * @access  Private
 */
exports.getLogoById = catchAsync(async (req, res, next) => {
    const logo = await LogoHistory.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!logo) {
        return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
        success: true,
        data: logo
    });
});

/**
 * @desc    Give feedback/rating to a logo
 * @route   POST /api/logos/:id/rate
 * @access  Private
 */
exports.rateLogo = catchAsync(async (req, res, next) => {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return next(new AppError('Please provide a rating between 1 and 5', 400));
    }

    const logo = await LogoHistory.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!logo) {
        return next(new AppError('Logo not found', 404));
    }

    logo.rating = rating;
    if (rating >= 4) logo.isSelected = true; // Auto-select highly rated logos? Optional logic
    await logo.save();

    res.status(200).json({
        success: true,
        data: logo
    });
});
