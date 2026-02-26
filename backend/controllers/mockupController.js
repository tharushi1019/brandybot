const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { generateMockupAI } = require('../services/aiService');

/**
 * @desc    Generate a mockup
 * @route   POST /api/mockups/generate
 * @access  Private
 */
exports.generateMockup = catchAsync(async (req, res, next) => {
    const { logoUrl, type } = req.body;

    if (!logoUrl || !type) {
        return next(new AppError('Please provide logoUrl and mockup type', 400));
    }

    // validate type
    const validTypes = ['businessCard', 'tshirt', 'signage', 'website', 'socialMedia'];
    if (!validTypes.includes(type)) {
        return next(new AppError(`Invalid mockup type. Allowed: ${validTypes.join(', ')}`, 400));
    }

    try {
        // Call AI Service
        const result = await generateMockupAI({
            logo_url: logoUrl,
            template_type: type
        });

        res.status(200).json({
            success: true,
            data: {
                mockupUrl: result.url,
                type: type
            }
        });
    } catch (error) {
        return next(new AppError('Mockup generation failed', 500));
    }
});

/**
 * @desc    Get available mockup templates
 * @route   GET /api/mockups/templates
 * @access  Private
 */
exports.getMockupTemplates = catchAsync(async (req, res, next) => {
    // Static list of available templates
    const templates = [
        { id: 'businessCard', name: 'Business Card', category: 'print' },
        { id: 'tshirt', name: 'T-Shirt', category: 'merchandise' },
        { id: 'signage', name: 'Office Signage', category: 'outdoor' },
        { id: 'website', name: 'Website Hero', category: 'digital' },
        { id: 'socialMedia', name: 'Social Media Kit', category: 'digital' }
    ];

    res.status(200).json({
        success: true,
        count: templates.length,
        data: templates
    });
});
