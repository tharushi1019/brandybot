const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { generateMockupAI } = require('../services/aiService');
const { sql } = require('../config/db');

/**
 * Template ID mapping — frontend uses snake_case, legacy used camelCase
 */
const TEMPLATE_MAP = {
    // Frontend sends these:
    business_card:  'businessCard',
    tshirt:         'tshirt',
    mug:            'mug',
    website_hero:   'website',
    social_banner:  'socialMedia',
    // Legacy camelCase (keep for compat):
    businessCard:   'businessCard',
    website:        'website',
    socialMedia:    'socialMedia',
    signage:        'signage',
};

const VALID_TYPES = ['businessCard', 'tshirt', 'mug', 'website', 'socialMedia', 'signage'];

/**
 * @desc    Generate a mockup
 * @route   POST /api/mockups/generate
 * @access  Private
 */
exports.generateMockup = catchAsync(async (req, res, next) => {
    // Accept both 'templateType' (new frontend) and 'type' (legacy)
    const rawType = req.body.templateType || req.body.type;
    const { logoUrl, brandName } = req.body;

    if (!rawType) {
        return next(new AppError('Please provide templateType', 400));
    }

    const type = TEMPLATE_MAP[rawType] || rawType;

    if (!VALID_TYPES.includes(type)) {
        return next(new AppError(`Invalid mockup type "${rawType}". Allowed: ${Object.keys(TEMPLATE_MAP).join(', ')}`, 400));
    }

    // 1. Check DB for existing mockup
    let existingMockup = null;
    if (logoUrl) {
        // Find by logoUrl (since logo_id might not be sent by frontend yet)
        // or join with logo_history. For now, let's use logo_id if provided, 
        // else try to find logo_id from logo_url
        let logoId = req.body.logoId;
        if (!logoId && logoUrl) {
            const [logo] = await sql`SELECT id FROM logo_history WHERE logo_url = ${logoUrl} LIMIT 1`;
            if (logo) logoId = logo.id;
        }

        if (logoId) {
            [existingMockup] = await sql`
                SELECT * FROM logo_mockups 
                WHERE logo_id = ${logoId} AND template_type = ${type}
            `;
        }
    }

    if (existingMockup) {
        console.log(`♻️ Returning cached mockup for ${type}`);
        return res.status(200).json({
            success: true,
            data: {
                mockupUrl: existingMockup.mockup_url,
                url: existingMockup.mockup_url,
                type,
                cached: true
            }
        });
    }

    // 2. Generate if not cached
    const result = await generateMockupAI({
        logo_url: logoUrl || null,
        template_type: type,
        brand_name: brandName || 'Brand',
    });

    // 3. Save to DB if we have a logoId
    let logoId = req.body.logoId;
    if (!logoId && logoUrl) {
        const [logo] = await sql`SELECT id FROM logo_history WHERE logo_url = ${logoUrl} LIMIT 1`;
        if (logo) logoId = logo.id;
    }

    if (logoId && result.url) {
        try {
            await sql`
                INSERT INTO logo_mockups (user_id, logo_id, template_type, mockup_url)
                VALUES (${req.user.id}, ${logoId}, ${type}, ${result.url})
                ON CONFLICT (logo_id, template_type) DO UPDATE SET mockup_url = ${result.url}
            `;
            console.log(`💾 Saved new mockup to DB: ${type}`);
        } catch (dbErr) {
            console.warn('⚠️ Failed to cache mockup to DB:', dbErr.message);
        }
    }

    res.status(200).json({
        success: true,
        data: {
            mockupUrl: result.url,
            url: result.url,   // alias for modal compatibility
            type,
            metadata: result.metadata,
            cached: false
        }
    });
});

/**
 * @desc    Get available mockup templates
 * @route   GET /api/mockups/templates
 * @access  Private
 */
exports.getMockupTemplates = catchAsync(async (req, res, next) => {
    const templates = [
        { id: 'business_card', name: 'Business Card',  category: 'print',       icon: '💼' },
        { id: 'tshirt',        name: 'T-Shirt',        category: 'merchandise', icon: '👕' },
        { id: 'mug',           name: 'Mug',            category: 'merchandise', icon: '☕' },
        { id: 'website_hero',  name: 'Website Hero',   category: 'digital',     icon: '🖥️' },
        { id: 'social_banner', name: 'Social Banner',  category: 'digital',     icon: '📱' },
    ];

    res.status(200).json({ success: true, count: templates.length, data: templates });
});
