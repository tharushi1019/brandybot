const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');

const { chatAI } = require('../services/aiService');

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

    try {
        // Call AI Service
        const aiResult = await chatAI({
            message: message,
            context: context
        });

        res.status(200).json({
            success: true,
            data: {
                message: aiResult.response,
                sender: 'ai',
                timestamp: new Date()
            }
        });
    } catch (error) {
        return next(new AppError('Chat service unavailable', 500));
    }
});
