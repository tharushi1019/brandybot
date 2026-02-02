const LogoHistory = require('../models/LogoHistory');
const User = require('../models/User');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { getConfig } = require('../config/env');

// Mock function to simulate AI generation (will be replaced by actual AI service call in Phase 5)
const mockGenerateLogo = async (prompt, style) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                logoUrl: `https://via.placeholder.com/500x500.png?text=${encodeURIComponent('Logo: ' + style)}`,
                colors: {
                    primary: '#FF5733',
                    secondary: '#33FF57',
                    accent: '#3357FF',
                    additional: ['#F1C40F']
                },
                fonts: {
                    primary: 'Roboto',
                    secondary: 'Open Sans'
                }
            });
        }, 2000); // Simulate 2s delay
    });
};

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

    // 3. Call AI Service (Mocked for Phase 4)
    try {
        // In Phase 5, this will be an axios call to the Python AI Service
        const aiResult = await mockGenerateLogo(prompt, style);

        // 4. Update history record with results
        logoEntry.logoUrl = aiResult.logoUrl;
        logoEntry.colors = { ...logoEntry.colors, ...aiResult.colors }; // Merge with defaults/AI results
        if (colors) logoEntry.colors.primary = colors; // Override if user provided specific color
        logoEntry.fonts = aiResult.fonts;
        logoEntry.status = 'completed';
        logoEntry.metadata = {
            width: 1024,
            height: 1024,
            format: 'png',
            fileSize: 1024 * 50 // Mock size
        };

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
