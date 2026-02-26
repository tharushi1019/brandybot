const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { generateResponse } = require('../services/llmService');

/**
 * @desc    Send a message to the AI chatbot
 * @route   POST /api/chat/message
 * @access  Private
 */
exports.sendMessage = catchAsync(async (req, res, next) => {
    const { message, context } = req.body;

    if (!message) {
        return next(new AppError('Message is required', 400));
    }

    const lowerMsg = message.toLowerCase();

    // --- Logo generation intent --- respond instantly, no Gemini call needed
    const isLogoIntent = lowerMsg.includes('generate') && (lowerMsg.includes('logo') || lowerMsg.includes('brand')) ||
        lowerMsg.includes('create logo') || lowerMsg.includes('make a logo') ||
        lowerMsg.includes('design logo') || lowerMsg.includes('i want to create') ||
        lowerMsg.includes('create a logo') || lowerMsg.includes('new logo') ||
        lowerMsg.startsWith('design');

    if (isLogoIntent) {
        return res.status(200).json({
            success: true,
            data: {
                message: "Great! Let's build your brand logo. I'll walk you through 7 quick questions to get all the details I need to create the perfect logo for you. 🎨",
                sender: 'ai',
                timestamp: new Date(),
                action: 'generate_logo',
                payload: {}
            }
        });
    }

    // --- Brand guidelines intent ---
    if (lowerMsg.includes('brand guideline') || lowerMsg.includes('brand identity') || lowerMsg.includes('brand kit')) {
        return res.status(200).json({
            success: true,
            data: {
                message: "Brand guidelines capture your colour palette, fonts, and brand voice in one document. You can generate them after creating a logo — use the Logo Generator to get started! 📘",
                sender: 'ai',
                timestamp: new Date()
            }
        });
    }

    // --- Mockup intent ---
    if (lowerMsg.includes('mockup') || lowerMsg.includes('t-shirt') || lowerMsg.includes('business card') || lowerMsg.includes('product')) {
        return res.status(200).json({
            success: true,
            data: {
                message: "I can show your logo on real products like business cards, T-shirts, and mugs! Generate a logo first, then use the Mockup Generator. 👕",
                sender: 'ai',
                timestamp: new Date()
            }
        });
    }

    // --- General chat --- use Gemini with graceful fallback
    const responseText = await generateResponse(message, context);

    res.status(200).json({
        success: true,
        data: {
            message: responseText,
            sender: 'ai',
            timestamp: new Date()
        }
    });
});

