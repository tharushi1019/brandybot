const { sql } = require('../config/db');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { generateLogoAI } = require('../services/aiService');
const { generateImagePrompt, generateLogoAgentReply } = require('../services/llmService');
const { deductCredit } = require('./creditController');

/**
 * @desc    Main Logo Agent conversational message endpoint
 *          Handles natural chat, collects brand context progressively,
 *          triggers logo generation when user intent is detected.
 * @route   POST /api/logo-agent/message
 * @access  Private
 */
exports.sendAgentMessage = catchAsync(async (req, res, next) => {
    const { sessionId, message, brandContext = {} } = req.body;

    if (!message) return next(new AppError('message is required', 400));

    // Verify session ownership if sessionId provided
    let session = null;
    if (sessionId) {
        [session] = await sql`
            SELECT * FROM chat_sessions WHERE id = ${sessionId} AND user_id = ${req.user.id}
        `;
        if (!session) return next(new AppError('Session not found', 404));
    } else {
        // Auto-create a session
        [session] = await sql`
            INSERT INTO chat_sessions (user_id, title)
            VALUES (${req.user.id}, 'New Chat')
            RETURNING *
        `;
    }

    // Save the user's message
    await sql`
        INSERT INTO chat_messages (session_id, user_id, role, content)
        VALUES (${session.id}, ${req.user.id}, 'user', ${message})
    `;
    await sql`UPDATE chat_sessions SET updated_at = NOW() WHERE id = ${session.id}`;

    // Auto-title on first message
    const [{ count }] = await sql`SELECT count(*) as count FROM chat_messages WHERE session_id = ${session.id}`;
    if (parseInt(count) === 1) {
        const title = message.length > 60 ? message.substring(0, 57) + '...' : message;
        await sql`UPDATE chat_sessions SET title = ${title} WHERE id = ${session.id}`;
    }

    // Get recent conversation history for context
    const history = await sql`
        SELECT role, content FROM chat_messages
        WHERE session_id = ${session.id}
        ORDER BY created_at ASC
        LIMIT 20
    `;

    // Call LLM with the Logo Agent system prompt
    const agentResult = await generateLogoAgentReply({
        message,
        history: history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.content }] })),
        brandContext: session.brand_context || brandContext
    });

    // Save AI reply
    await sql`
        INSERT INTO chat_messages (session_id, user_id, role, content, action, metadata)
        VALUES (
            ${session.id}, ${req.user.id}, 'ai',
            ${agentResult.reply},
            ${agentResult.shouldGenerate ? 'generate_logo' : null},
            ${sql.json({ updatedBrandContext: agentResult.updatedBrandContext })}
        )
    `;

    // Update session's brand_context with what we learned
    if (agentResult.updatedBrandContext && Object.keys(agentResult.updatedBrandContext).length > 0) {
        await sql`
            UPDATE chat_sessions SET brand_context = ${sql.json(agentResult.updatedBrandContext)} WHERE id = ${session.id}
        `;
    }

    // If agent says we have enough info and user wants to generate — DO IT
    if (agentResult.shouldGenerate) {
        const ctx = agentResult.updatedBrandContext || {};

        // Check credits
        try {
            await deductCredit(req.user.id, null);
        } catch (creditErr) {
            return res.status(402).json({
                success: false,
                message: creditErr.message,
                action: 'buy_credits'
            });
        }        // Build prompt via LLM
        let sdPromptData = null;
        let basePrompt = ctx.description || ctx.brandName || 'professional minimalist logo';
        try {
            sdPromptData = await generateImagePrompt(ctx);
            basePrompt = sdPromptData.sd_prompt;
        } catch (e) {
            console.warn('Prompt enrichment failed:', e.message);
        }

        // Create 4 placeholder logo_history entries (one per variant)
        const { generateLogoVariants } = require('../services/aiService');
        const groupId = require('crypto').randomUUID();

        const variants = ['geometric minimalist', 'gradient modern'];
        const logoEntries = await Promise.all(variants.map(style =>
            sql`INSERT INTO logo_history (user_id, brand_name, prompt, industry, style, status, logo_url, generation_group_id)
                VALUES (${req.user.id}, ${ctx.brandName || 'Brand'}, ${basePrompt}, ${ctx.industry || ''}, ${style}, 'processing', 'processing...', ${groupId})
                RETURNING *`.then(rows => rows[0])
        ));

        // Generate all 4 variants in parallel
        try {
            const aiResults = await generateLogoVariants(basePrompt, ctx);
            const axios = require('axios');

            // Build colors from prompt data
            const suggestedColors = sdPromptData?.suggestedColors || {};
            const colorsJson = {
                primary:   ctx.colors || suggestedColors.primary || '#7C3AED',
                secondary: suggestedColors.secondary || '#3B82F6',
                accent:    suggestedColors.accent || '#F59E0B',
                additional: []
            };
            const fontsJson = { primary: 'Inter', secondary: 'Helvetica' };

            // Upload each result to ImgBB and update its logo_history row
            const completedLogos = await Promise.all(
                logoEntries.map(async (entry, i) => {
                    const aiResult = aiResults[i];
                    if (!aiResult) {
                        await sql`UPDATE logo_history SET status = 'failed', error_message = 'Generation failed' WHERE id = ${entry.id}`;
                        return null;
                    }
                    let logoUrl = aiResult.url;
                    try {
                        const base64Data = aiResult.url.replace(/^data:image\/\w+;base64,/, '');
                        const imgbbRes = await axios.post(
                            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                            new URLSearchParams({ image: base64Data }),
                            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                        );
                        logoUrl = imgbbRes.data.data.url;
                    } catch (uploadErr) {
                        console.warn('ImgBB upload failed, using base64:', uploadErr.message);
                    }

                    const [completed] = await sql`
                        UPDATE logo_history SET
                            logo_url  = ${logoUrl},
                            colors    = ${sql.json(colorsJson)},
                            fonts     = ${sql.json(fontsJson)},
                            status    = 'completed',
                            metadata  = ${sql.json({ ...(aiResult.metadata || {}), updatedBrandContext: agentResult.updatedBrandContext })}
                        WHERE id = ${entry.id}
                        RETURNING *
                    `;
                    return completed;
                })
            );

            const successLogos = completedLogos.filter(Boolean);
            const primaryLogo  = successLogos[0];

            if (primaryLogo) {
                await sql`UPDATE chat_sessions SET logo_id = ${primaryLogo.id} WHERE id = ${session.id}`;

                // Save all logos metadata to the generate_logo message
                await sql`
                    UPDATE chat_messages SET metadata = ${sql.json({
                        updatedBrandContext: agentResult.updatedBrandContext,
                        logoResults: successLogos,
                        logoResult:  primaryLogo
                    })}
                    WHERE session_id = ${session.id} AND action = 'generate_logo'
                    AND id = (SELECT id FROM chat_messages WHERE session_id = ${session.id} AND action = 'generate_logo' ORDER BY created_at DESC LIMIT 1)
                `;

                // Auto-generate brand guidelines for primary logo only
                try {
                    const { generateBrandGuidelines } = require('../services/llmService');
                    const guidelines = await generateBrandGuidelines({
                        brandName:      ctx.brandName || primaryLogo.brand_name,
                        industry:       ctx.industry  || primaryLogo.industry || '',
                        targetAudience: ctx.targetAudience || '',
                        personality:    ctx.personality || '',
                        colors:         ctx.colors || '',
                        logoUrl:        primaryLogo.logo_url,
                        aiPrompt:       primaryLogo.prompt || '',
                        logoColors:     colorsJson,
                        logoFont:       fontsJson,
                        logoStyle:      ctx.style || primaryLogo.style,
                    });
                    await sql`
                        UPDATE logo_history
                        SET metadata = metadata || ${sql.json({ brand_guidelines: guidelines })}::jsonb
                        WHERE id = ${primaryLogo.id}
                    `;
                } catch (guidelinesErr) {
                    console.warn('⚠️  Auto-guidelines generation failed:', guidelinesErr.message);
                }
            }

            // Update user stats
            const userStats = req.user.stats || { logosGenerated: 0 };
            userStats.logosGenerated = (userStats.logosGenerated || 0) + 2;
            await sql`UPDATE users SET stats = ${sql.json(userStats)} WHERE id = ${req.user.id}`;

            return res.status(200).json({
                success: true,
                data: {
                    sessionId: session.id,
                    reply: agentResult.reply,
                    action: 'logos_generated',
                    logos: successLogos,
                    logo: primaryLogo,          // backward compat
                    brandContext: agentResult.updatedBrandContext,
                    promptData: sdPromptData
                }
            });

        } catch (genError) {
            await Promise.all(logoEntries.map(e =>
                sql`UPDATE logo_history SET status = 'failed', error_message = ${genError.message} WHERE id = ${e.id}`
            ));
            return next(new AppError('Logo generation failed: ' + genError.message, 500));
        }
    }

    // Normal conversational reply
    res.status(200).json({
        success: true,
        data: {
            sessionId: session.id,
            reply: agentResult.reply,
            brandContext: agentResult.updatedBrandContext,
            shouldGenerate: false
        }
    });
});

/**
 * @desc    Guest one-time logo generation via conversational agent
 * @route   POST /api/logo-agent/guest-message
 * @access  Public
 */
exports.sendGuestMessage = catchAsync(async (req, res, next) => {
    const { message, brandContext = {}, fingerprint } = req.body;

    if (!message) return next(new AppError('message is required', 400));
    if (!fingerprint) return next(new AppError('fingerprint is required', 400));

    // Check guest credit
    const [guestSession] = await sql`
        SELECT * FROM guest_sessions WHERE fingerprint = ${fingerprint}
    `;

    if (guestSession?.used) {
        return res.status(402).json({
            success: false,
            message: 'You have used your free generation. Please sign in to get 50 credits.',
            action: 'require_login'
        });
    }

    // Get conversational reply from LLM
    const agentResult = await generateLogoAgentReply({ message, history: [], brandContext });

    if (!agentResult.shouldGenerate) {
        return res.status(200).json({
            success: true,
            data: {
                reply: agentResult.reply,
                brandContext: agentResult.updatedBrandContext,
                shouldGenerate: false,
                isGuest: true
            }
        });
    }

    // Generate logo for guest
    const ctx = agentResult.updatedBrandContext || brandContext;
    let sdPromptData = null;
    let finalPrompt = ctx.brandName || 'professional minimalist logo';
    try {
        sdPromptData = await generateImagePrompt(ctx);
        finalPrompt = sdPromptData.sd_prompt;
    } catch (e) { /* use fallback */ }

    const [logoEntry] = await sql`
        INSERT INTO logo_history (user_id, brand_name, prompt, industry, style, status, logo_url)
        VALUES (${null}, ${ctx.brandName || 'Guest Brand'}, ${finalPrompt}, ${ctx.industry || ''}, ${ctx.style || 'modern'}, 'processing', 'processing...')
        RETURNING *
    `;

    // Note: guest logo_history rows have user_id = null — must allow this in DB or use a guest_user_id
    // TODO: adjust schema to allow null user_id for logo_history if needed

    // Mark guest session as used
    await sql`
        INSERT INTO guest_sessions (fingerprint, logo_id, used)
        VALUES (${fingerprint}, ${logoEntry.id}, true)
        ON CONFLICT (fingerprint) DO UPDATE SET used = true, logo_id = ${logoEntry.id}
    `;

    res.status(200).json({
        success: true,
        data: {
            reply: agentResult.reply + '\n\n🎉 Sign in now to save your logo and get 50 free credits!',
            brandContext: agentResult.updatedBrandContext,
            shouldGenerate: true,
            isGuest: true,
            logoEntry: logoEntry
        }
    });
});
