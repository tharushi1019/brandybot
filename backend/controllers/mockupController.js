const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');

// Mock function to simulate AI Mockup generation
const mockGenerateMockup = async (type, logoUrl) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                mockupUrl: `https://via.placeholder.com/800x600.png?text=Mockup+${type}+${encodeURIComponent(logoUrl.substring(0, 5))}`,
                type: type
            });
        }, 1500); // Simulate 1.5s delay
    });
};

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
        // Call AI Service (Mocked)
        const result = await mockGenerateMockup(type, logoUrl);

        res.status(200).json({
            success: true,
            data: result
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
