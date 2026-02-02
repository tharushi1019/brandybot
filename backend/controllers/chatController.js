const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');

// Mock AI Chat response
const mockChatResponse = async (message) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const responses = [
                "That's a great idea for your brand! Have you considered using blue tones?",
                "I can help you design a logo that matches that description.",
                "Would you like to try a minimalist style for this?",
                "Tell me more about your target audience.",
                "I've noted that preference. Let's refine your brand guidelines."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            resolve(randomResponse);
        }, 1000);
    });
};

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
        // Call AI Service (Mocked)
        // In Phase 5, we will pass the conversation history and context here
        const aiResponse = await mockChatResponse(message);

        res.status(200).json({
            success: true,
            data: {
                message: aiResponse,
                sender: 'ai',
                timestamp: new Date()
            }
        });
    } catch (error) {
        return next(new AppError('Chat service unavailable', 500));
    }
});
