const { sql } = require('../config/db');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { generateLogoAI, generateLogoLockupAI } = require('../services/aiService');
const { generateImagePrompt } = require('../services/llmService');
const path = require('path');
const fs = require('fs');

// Ensure logos directory exists
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'logos');
try {
    if (!fs.existsSync(LOGOS_DIR)) {
        fs.mkdirSync(LOGOS_DIR, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Unable to create local logos directory (normal in read-only serverless environments):', err.message);
}

/**
 * Upload a base64 image to ImgBB.
 * Returns the public-accessible ImgBB URL.
 */
const uploadToImgBB = async (base64DataUrl) => {
    const axios = require('axios');
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) throw new Error("IMGBB_API_KEY not configured in environment variables");

    // Strip data:image/png;base64, prefix if present
    const base64Data = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');

    const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        new URLSearchParams({ image: base64Data }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data.data.url;
};

/**
 * @desc    Generate a new logo
 * @route   POST /api/logos/generate
 * @access  Private
 */
exports.generateLogo = catchAsync(async (req, res, next) => {
    const { brandName, prompt, style, industry, colors, targetAudience, personality, tagline } = req.body;

    if (!brandName || !prompt) {
        return next(new AppError('Please provide brand name and prompt', 400));
    }

    // 1. Create initial history record (Status: Processing)
    const [logoEntry] = await sql`
        INSERT INTO logo_history (
            user_id, brand_name, prompt, industry, style, status, logo_url
        ) VALUES (
            ${req.user.id}, ${brandName}, ${prompt}, ${industry || ''},
            ${style || 'modern'}, 'processing', 'processing...'
        )
        RETURNING *
    `;

    // 2. Build a rich prompt using LLM if we have brand profile context
    let finalPrompt = prompt;
    let sdPromptData = null;

    try {
        const brandProfile = {
            brandName,
            tagline: tagline || '',
            industry: industry || '',
            targetAudience: targetAudience || '',
            personality: personality || '',
            colors: colors || '',
            style: style || 'modern flat vector'
        };
        sdPromptData = await generateImagePrompt(brandProfile);
        finalPrompt = sdPromptData.sd_prompt;
        console.log('🎨 Rich SD Prompt Generated:', finalPrompt.substring(0, 80) + '...');
    } catch (promptError) {
        console.warn('⚠️ Prompt enrichment failed, using original prompt:', promptError.message);
        finalPrompt = prompt;
    }

    // 3. Call AI Service
    try {
        const aiResult = await generateLogoAI({
            brand_name: brandName,
            prompt: finalPrompt,
            style,
            industry,
            colors: colors ? [colors] : []
        });

        // GRANT ACCESS TO PROTECTED ROUTE
        console.log(`🔓 User Auth Success: ${req.user.email} (UUID: ${req.user.id})`);

        // 4. Upload logo to ImgBB
        let logoUrl = aiResult.url;
        try {
            logoUrl = await uploadToImgBB(aiResult.url);
            console.log(`💾 Logo uploaded to ImgBB: ${logoUrl}`);
        } catch (uploadError) {
            console.warn('⚠️ Failed to upload logo to ImgBB, using base64:', uploadError.message);
            logoUrl = aiResult.url; // Fallback to base64 data URL
        }

        // 5. Update history record
        const colorsJson = {
            primary: colors || '#7C3AED',
            secondary: '#3B82F6',
            accent: '#F59E0B',
            additional: []
        };
        const fontsJson = { primary: 'Inter', secondary: 'Helvetica' };

        const [completedLogo] = await sql`
            UPDATE logo_history SET
                logo_url = ${logoUrl},
                colors = ${sql.json(colorsJson)},
                fonts = ${sql.json(fontsJson)},
                status = 'completed',
                metadata = ${sql.json(aiResult.metadata || {})},
                updated_at = NOW()
            WHERE id = ${logoEntry.id}
            RETURNING *
        `;

        // 6. Update user stats
        const userStats = req.user.stats || { logosGenerated: 0, brandsCreated: 0 };
        userStats.logosGenerated = (userStats.logosGenerated || 0) + 1;
        await sql`UPDATE users SET stats = ${sql.json(userStats)} WHERE id = ${req.user.id}`;
        req.user.stats = userStats;

        res.status(200).json({
            success: true,
            data: {
                ...completedLogo,
                promptData: sdPromptData // Include prompt metadata for frontend
            }
        });

    } catch (error) {
        // Handle generation failure
        await sql`
            UPDATE logo_history SET
                status = 'failed',
                error_message = ${error.message},
                updated_at = NOW()
            WHERE id = ${logoEntry.id}
        `;
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
    const offset = (page - 1) * limit;

    console.log(`📡 Fetching logo history for user: ${req.user.id} (Page: ${page}, Limit: ${limit})`);
    
    // Only return successfully completed logos — not failed or processing
    const history = await sql`
        SELECT * FROM logo_history
        WHERE user_id = ${req.user.id}
          AND status = 'completed'
          AND logo_url IS NOT NULL
          AND logo_url != 'processing...'
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
    `;

    console.log(`✅ Found ${history.length} completed logos for user ${req.user.id}`);

    const [{ count }] = await sql`
        SELECT count(*) as count FROM logo_history
        WHERE user_id = ${req.user.id}
          AND status = 'completed'
          AND logo_url != 'processing...'
    `;
    const total = parseInt(count, 10);

    res.status(200).json({
        success: true,
        count: history.length,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        data: history
    });
});


/**
 * @desc    Get single logo details
 * @route   GET /api/logos/:id
 * @access  Private
 */
exports.getLogoById = catchAsync(async (req, res, next) => {
    const [logo] = await sql`
        SELECT * FROM logo_history WHERE id = ${req.params.id} AND user_id = ${req.user.id}
    `;
    if (!logo) return next(new AppError('Logo not found', 404));

    res.status(200).json({ success: true, data: logo });
});

/**
 * @desc    Rate a logo
 * @route   POST /api/logos/:id/rate
 * @access  Private
 */
exports.rateLogo = catchAsync(async (req, res, next) => {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        return next(new AppError('Please provide a rating between 1 and 5', 400));
    }

    const updates = { rating, updated_at: sql`NOW()` };
    if (rating >= 4) updates.is_selected = true;

    const [logo] = await sql`
        UPDATE logo_history
        SET ${sql(updates, Object.keys(updates))}
        WHERE id = ${req.params.id} AND user_id = ${req.user.id}
        RETURNING *
    `;
    if (!logo) return next(new AppError('Logo not found', 404));

    res.status(200).json({ success: true, data: logo });
});

/**
 * @desc    Generate a transparent typography lockup for a logo
 * @route   POST /api/logos/lockup
 * @access  Private
 */
exports.generateLogoLockup = catchAsync(async (req, res, next) => {
    const {
        logoId,
        logoUrl,
        brandName,
        tagline,
        layout,
        fontFamily,
        primaryColor,
        secondaryColor,
        fontSizeName,
        fontSizeTagline,
        gap,
        compiledBase64
    } = req.body;

    if (!brandName) {
        return next(new AppError('Brand name is required', 400));
    }

    let finalLogoUrl = logoUrl;

    if (logoId) {
        const [logo] = await sql`
            SELECT logo_url FROM logo_history WHERE id = ${logoId} AND user_id = ${req.user.id}
        `;
        if (logo) {
            finalLogoUrl = logo.logo_url;
        }
    }

    // Bypass Python service completely if compiledBase64 is provided directly by client
    if (compiledBase64) {
        try {
            console.log(`💾 Controller: Uploading pre-compiled client-side lockup for '${brandName}'`);
            const lockupUrl = await uploadToImgBB(compiledBase64);
            console.log(`💾 Transparent Lockup uploaded to ImgBB: ${lockupUrl}`);

            return res.status(200).json({
                success: true,
                data: {
                    lockupUrl,
                    settings: {
                        layout,
                        fontFamily,
                        primaryColor,
                        secondaryColor,
                        fontSizeName,
                        fontSizeTagline,
                        gap
                    }
                }
            });
        } catch (uploadError) {
            console.error('❌ Direct ImgBB upload of client lockup failed:', uploadError.message);
            return next(new AppError('Direct lockup upload failed: ' + uploadError.message, 500));
        }
    }

    if (!finalLogoUrl) {
        return next(new AppError('Logo icon URL is required', 400));
    }

    try {
        console.log(`🔤 Controller: Generating lockup for '${brandName}' via Python AI Service`);
        
        const aiResult = await generateLogoLockupAI({
            logoUrl: finalLogoUrl,
            brandName,
            tagline,
            layout,
            fontFamily,
            primaryColor,
            secondaryColor,
            fontSizeName,
            fontSizeTagline,
            gap
        });

        let lockupUrl = aiResult.url;
        try {
            lockupUrl = await uploadToImgBB(aiResult.url);
            console.log(`💾 Transparent Lockup uploaded to ImgBB: ${lockupUrl}`);
        } catch (uploadError) {
            console.warn('⚠️ Failed to upload lockup to ImgBB, using base/local URL:', uploadError.message);
        }

        res.status(200).json({
            success: true,
            data: {
                lockupUrl,
                settings: {
                    layout,
                    fontFamily,
                    primaryColor,
                    secondaryColor,
                    fontSizeName,
                    fontSizeTagline,
                    gap
                }
            }
        });

    } catch (error) {
        console.error('❌ Lockup generation controller failed:', error.message);
        return next(new AppError('Lockup generation failed: ' + error.message, 500));
    }
});

