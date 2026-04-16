const { sql } = require('../config/db');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');

/**
 * @desc    List all chat sessions for current user
 * @route   GET /api/chat/sessions
 * @access  Private
 */
exports.getSessions = catchAsync(async (req, res, next) => {
    const sessions = await sql`
        SELECT cs.*, 
               (SELECT content FROM chat_messages cm 
                WHERE cm.session_id = cs.id 
                ORDER BY created_at DESC LIMIT 1) as last_message
        FROM chat_sessions cs
        WHERE cs.user_id = ${req.user.id}
        ORDER BY cs.updated_at DESC
        LIMIT 50
    `;

    res.status(200).json({ success: true, count: sessions.length, data: sessions });
});

/**
 * @desc    Create a new chat session
 * @route   POST /api/chat/sessions
 * @access  Private
 */
exports.createSession = catchAsync(async (req, res, next) => {
    const { title } = req.body;

    const [session] = await sql`
        INSERT INTO chat_sessions (user_id, title)
        VALUES (${req.user.id}, ${title || 'New Chat'})
        RETURNING *
    `;

    res.status(201).json({ success: true, data: session });
});

/**
 * @desc    Get a single session with all messages
 * @route   GET /api/chat/sessions/:id
 * @access  Private
 */
exports.getSessionById = catchAsync(async (req, res, next) => {
    const [session] = await sql`
        SELECT * FROM chat_sessions
        WHERE id = ${req.params.id} AND user_id = ${req.user.id}
    `;
    if (!session) return next(new AppError('Session not found', 404));

    const messages = await sql`
        SELECT * FROM chat_messages
        WHERE session_id = ${req.params.id}
        ORDER BY created_at ASC
    `;

    // If this session has a linked logo, attach it to the generate_logo message
    // so the frontend can render the logo image when restoring chat history
    let logoData = null;
    if (session.logo_id) {
        [logoData] = await sql`
            SELECT * FROM logo_history WHERE id = ${session.logo_id}
        `;
    }

    const enrichedMessages = messages.map(msg => {
        // Attach logo to the message that triggered generation
        if (msg.action === 'generate_logo' && logoData) {
            return {
                ...msg,
                metadata: {
                    ...(msg.metadata || {}),
                    logoResult: logoData,
                }
            };
        }
        return msg;
    });

    res.status(200).json({
        success: true,
        data: { ...session, messages: enrichedMessages }
    });
});

/**
 * @desc    Add a message to a session (also updates session title if first message)
 * @route   POST /api/chat/sessions/:id/message
 * @access  Private
 */
exports.addMessage = catchAsync(async (req, res, next) => {
    const { role, content, action, metadata } = req.body;

    if (!content || !role) return next(new AppError('role and content are required', 400));
    if (!['user', 'ai'].includes(role)) return next(new AppError('role must be user or ai', 400));

    // Check session belongs to user
    const [session] = await sql`
        SELECT id FROM chat_sessions WHERE id = ${req.params.id} AND user_id = ${req.user.id}
    `;
    if (!session) return next(new AppError('Session not found', 404));

    const [message] = await sql`
        INSERT INTO chat_messages (session_id, user_id, role, content, action, metadata)
        VALUES (${req.params.id}, ${req.user.id}, ${role}, ${content}, ${action || null}, ${sql.json(metadata || {})})
        RETURNING *
    `;

    // Update session timestamp and auto-title from first user message
    const [msgCount] = await sql`SELECT count(*) as count FROM chat_messages WHERE session_id = ${req.params.id}`;
    if (parseInt(msgCount.count) === 1 && role === 'user') {
        const autoTitle = content.length > 60 ? content.substring(0, 57) + '...' : content;
        await sql`UPDATE chat_sessions SET title = ${autoTitle}, updated_at = NOW() WHERE id = ${req.params.id}`;
    } else {
        await sql`UPDATE chat_sessions SET updated_at = NOW() WHERE id = ${req.params.id}`;
    }

    res.status(201).json({ success: true, data: message });
});

/**
 * @desc    Delete a session and all its messages
 * @route   DELETE /api/chat/sessions/:id
 * @access  Private
 */
exports.deleteSession = catchAsync(async (req, res, next) => {
    const [session] = await sql`
        DELETE FROM chat_sessions
        WHERE id = ${req.params.id} AND user_id = ${req.user.id}
        RETURNING id
    `;
    if (!session) return next(new AppError('Session not found', 404));

    res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Update session metadata (brand context, logo linkage)
 * @route   PATCH /api/chat/sessions/:id
 * @access  Private
 */
exports.updateSession = catchAsync(async (req, res, next) => {
    const { title, brandContext, logoId, status } = req.body;
    const updates = { updated_at: sql`NOW()` };

    if (title) updates.title = title;
    if (brandContext) updates.brand_context = sql.json(brandContext);
    if (logoId) updates.logo_id = logoId;
    if (status) updates.status = status;

    const [session] = await sql`
        UPDATE chat_sessions SET ${sql(updates, Object.keys(updates))}
        WHERE id = ${req.params.id} AND user_id = ${req.user.id}
        RETURNING *
    `;
    if (!session) return next(new AppError('Session not found', 404));

    res.status(200).json({ success: true, data: session });
});
