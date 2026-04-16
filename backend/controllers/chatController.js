const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { generateResponse } = require('../services/llmService');
const { sql } = require('../config/db');

// Detect intent from message
const detectIntent = (msg) => {
    const lower = msg.toLowerCase();
    const isLogoGen = /(generate|create|make|build|design|want).{0,25}logo/i.test(msg) ||
                     /new logo|logo for my|our logo|brand logo/i.test(msg) ||
                     lower.startsWith('design');
    const isGuidelines = /brand guideline|brand kit|brand identity|brand book|color palette|colour palette/i.test(msg);
    const isMockup = /mockup|t.?shirt|business card|mug|product preview|see.{0,15}logo on/i.test(msg);
    const isOffTopic = /(weather|recipe|joke|sport|score|game|movie|music|code|program|calculate|math|travel|food|cook)/i.test(msg) &&
                       !/(brand|logo|design|color|font|business|company|marketing|identity)/i.test(msg);
    return { isLogoGen, isGuidelines, isMockup, isOffTopic };
};

// Extract basic brand context from a message list (used when saving guest sessions)
const extractBrandContext = (messages) => {
    const ctx = {};
    const text = messages.map(m => m.content).join(' ');
    const nameMatch = text.match(/(?:my brand(?:'s| is| name is)?|called|named|brand name[: ]+)([A-Za-z0-9 ]{2,30})/i);
    if (nameMatch) ctx.brandName = nameMatch[1].trim();
    const industries = ['tech', 'food', 'fashion', 'health', 'finance', 'education', 'fitness', 'beauty', 'real estate', 'web development', 'software'];
    industries.forEach(ind => { if (text.toLowerCase().includes(ind)) ctx.industry = ind; });
    const styles = ['modern', 'minimalist', 'luxury', 'playful', 'bold', 'geometric', 'flat', 'futuristic'];
    styles.forEach(s => { if (text.toLowerCase().includes(s)) ctx.style = s; });
    return ctx;
};

/**
 * @desc    Guest chat — public endpoint, branding Q&A via Gemini with full history
 * @route   POST /api/chat/guest-message
 * @access  Public
 */
exports.guestMessage = catchAsync(async (req, res, next) => {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return next(new AppError('Message is required', 400));

    const { isLogoGen, isGuidelines, isMockup, isOffTopic } = detectIntent(message);

    if (isOffTopic) {
        return res.status(200).json({
            success: true,
            data: {
                message: "I specialize in branding and logo design! I can't help with that topic, but I'd love to help you build your brand. What are you working on? 🎨",
                action: null
            }
        });
    }

    if (isLogoGen) {
        return res.status(200).json({
            success: true,
            data: {
                message: "I'd love to create a logo for you! 🎨 You'll need a free account — it only takes 10 seconds and you'll get 3 free logo generations. Your chat history will be saved automatically after login.",
                action: 'prompt_login',
                payload: { reason: 'logo_generation' }
            }
        });
    }

    if (isGuidelines) {
        return res.status(200).json({
            success: true,
            data: {
                message: "Brand guidelines are generated automatically after you create a logo! Sign up for free to get started — your conversation here will carry over. 📋",
                action: 'prompt_login',
                payload: { reason: 'guidelines' }
            }
        });
    }

    if (isMockup) {
        return res.status(200).json({
            success: true,
            data: {
                message: "Mockups let you see your logo on real products! Create a free account and generate your logo first. Your current chat will be saved after login. 👕",
                action: 'prompt_login',
                payload: { reason: 'mockup' }
            }
        });
    }

    // General branding Q&A via Gemini — pass full conversation history for memory
    const responseText = await generateResponse(message, history);

    res.status(200).json({
        success: true,
        data: { message: responseText, action: null }
    });
});

/**
 * @desc    Save guest conversation to Supabase after login
 * @route   POST /api/chat/save-guest-session
 * @access  Private (called right after login)
 */
exports.saveGuestSession = catchAsync(async (req, res, next) => {
    const { messages = [] } = req.body;
    const userId = req.user.id;

    if (!messages.length) {
        return res.status(200).json({ success: true, data: { sessionId: null } });
    }

    // Extract brand context from conversation
    const brandCtx = extractBrandContext(messages);

    // Build a title from the first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
        : 'Imported from chat';

    // Create chat session
    const [session] = await sql`
        INSERT INTO chat_sessions (user_id, title, brand_context, status)
        VALUES (${userId}, ${title}, ${sql.json(brandCtx)}, 'active')
        RETURNING id
    `;

    // Insert all messages
    if (messages.length > 0) {
        await sql`
            INSERT INTO chat_messages ${sql(
                messages.map(m => ({
                    session_id: session.id,
                    user_id: userId,
                    role: m.role === 'assistant' || m.role === 'bot' ? 'ai' : 'user',
                    content: m.content,
                    metadata: {}
                }))
            )}
        `;
    }

    res.status(201).json({
        success: true,
        data: { sessionId: session.id, brandContext: brandCtx }
    });
});

/**
 * @desc    Authenticated chat — saves messages to DB, supports logo/guidelines/mockup triggers
 * @route   POST /api/chat/message
 * @access  Private
 */
exports.sendMessage = catchAsync(async (req, res, next) => {
    const { message, context, history = [], sessionId } = req.body;
    if (!message) return next(new AppError('Message is required', 400));

    const { isLogoGen, isGuidelines, isMockup, isOffTopic } = detectIntent(message);
    const userId = req.user.id;
    let activeSessionId = sessionId;

    // Create session on the fly if none provided
    if (!activeSessionId) {
        const [session] = await sql`
            INSERT INTO chat_sessions (user_id, title, status)
            VALUES (${userId}, ${message.slice(0, 60)}, 'active')
            RETURNING id
        `;
        activeSessionId = session.id;
    }

    // Persist user message to DB
    await sql`
        INSERT INTO chat_messages (session_id, user_id, role, content)
        VALUES (${activeSessionId}, ${userId}, 'user', ${message})
    `;

    let botText = '';
    let action = null;
    let payload = null;

    if (isOffTopic) {
        botText = "I specialize in logo design and branding only 🎨 — I can't help with that. What brand are you building?";
    } else if (isLogoGen) {
        const name = req.user?.display_name?.split(' ')[0] || '';
        botText = `${name ? `Let's go, ${name}! ` : ''}I'll take you to the Logo Agent where I'll craft the perfect logo for your brand. 🎨`;
        action = 'generate_logo';
        payload = { sessionId: activeSessionId };
    } else if (isGuidelines) {
        botText = "Brand guidelines (colour palette, fonts, logo usage rules) are auto-generated after you create a logo in the Logo Agent! 📋";
        action = 'open_guidelines';
    } else if (isMockup) {
        botText = "Preview your logo on business cards, T-shirts, mugs and more in the Mockup Studio! Head there after generating your logo. 👕";
        action = 'open_mockup';
    } else {
        // General AI response with conversation history
        botText = await generateResponse(message, history);
    }

    // Persist AI response to DB
    await sql`
        INSERT INTO chat_messages (session_id, user_id, role, content, action)
        VALUES (${activeSessionId}, ${userId}, 'ai', ${botText}, ${action || null})
    `;

    res.status(200).json({
        success: true,
        data: {
            message: botText,
            sender: 'ai',
            sessionId: activeSessionId,
            action,
            payload,
            timestamp: new Date()
        }
    });
});
