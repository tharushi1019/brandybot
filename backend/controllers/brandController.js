const { sql } = require('../config/db');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const { generateBrandGuidelines } = require('../services/llmService');
const crypto = require('crypto');


/**
 * @desc    Create a new brand
 * @route   POST /api/brands
 * @access  Private
 */
exports.createBrand = catchAsync(async (req, res, next) => {
    const { brandName, tagline, description, industry, logo, guidelines } = req.body;

    if (!brandName) {
        return next(new AppError('Brand name is required', 400));
    }

    const [brand] = await sql`
        INSERT INTO brands (
            user_id, brand_name, tagline, description, industry, logo, guidelines, last_updated_by
        ) VALUES (
            ${req.user.id}, ${brandName}, ${tagline || ''}, ${description || ''}, ${industry || ''}, 
            ${sql.json(logo || { primaryLogoUrl: 'placeholder' })}, ${sql.json(guidelines || {})}, ${req.user.id}
        )
        RETURNING *
    `;

    // Increment user brand count
    const userStats = req.user.stats || { logosGenerated: 0, brandsCreated: 0 };
    userStats.brandsCreated = (userStats.brandsCreated || 0) + 1;
    await sql`UPDATE users SET stats = ${sql.json(userStats)} WHERE id = ${req.user.id}`;
    req.user.stats = userStats;

    res.status(201).json({
        success: true,
        data: brand
    });
});

/**
 * @desc    Get all brands for current user
 * @route   GET /api/brands
 * @access  Private
 */
exports.getUserBrands = catchAsync(async (req, res, next) => {
    let brands;
    if (req.query.status) {
        brands = await sql`SELECT * FROM brands WHERE user_id = ${req.user.id} AND status = ${req.query.status} ORDER BY updated_at DESC`;
    } else {
        brands = await sql`SELECT * FROM brands WHERE user_id = ${req.user.id} ORDER BY updated_at DESC`;
    }

    res.status(200).json({
        success: true,
        count: brands.length,
        data: brands
    });
});

/**
 * @desc    Get single brand by ID
 * @route   GET /api/brands/:id
 * @access  Private
 */
exports.getBrandById = catchAsync(async (req, res, next) => {
    const [brand] = await sql`SELECT * FROM brands WHERE id = ${req.params.id} AND user_id = ${req.user.id}`;

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    res.status(200).json({
        success: true,
        data: brand
    });
});

/**
 * @desc    Update brand details
 * @route   PUT /api/brands/:id
 * @access  Private
 */
exports.updateBrand = catchAsync(async (req, res, next) => {
    const [brand] = await sql`SELECT * FROM brands WHERE id = ${req.params.id} AND user_id = ${req.user.id}`;

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    // Update allowed fields
    const {
        brandName, tagline, description, industry, targetAudience,
        logo, guidelines, mockups, assets
    } = req.body;

    const updates = {};
    if (brandName) updates.brand_name = brandName;
    if (tagline !== undefined) updates.tagline = tagline;
    if (description !== undefined) updates.description = description;
    if (industry) updates.industry = industry;
    if (targetAudience) updates.target_audience = targetAudience;

    // For jsonb fields, we merge them in JS and then wrap in sql.json()
    if (logo) updates.logo = sql.json({ ...brand.logo, ...logo });
    if (guidelines) updates.guidelines = sql.json(guidelines);
    if (mockups) updates.mockups = sql.json(mockups);
    if (assets) updates.assets = sql.json(assets);

    updates.version = brand.version + 1;
    updates.last_updated_by = req.user.id;
    updates.updated_at = sql`NOW()`;

    let updatedBrand = brand;
    if (Object.keys(updates).length > 0) {
        const [result] = await sql`
            UPDATE brands SET ${sql(updates, Object.keys(updates))}
            WHERE id = ${brand.id}
            RETURNING *
        `;
        if (result) updatedBrand = result;
    }

    res.status(200).json({
        success: true,
        data: updatedBrand
    });
});

/**
 * @desc    Delete brand
 * @route   DELETE /api/brands/:id
 * @access  Private
 */
exports.deleteBrand = catchAsync(async (req, res, next) => {
    const [brand] = await sql`DELETE FROM brands WHERE id = ${req.params.id} AND user_id = ${req.user.id} RETURNING id`;

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

/**
 * @desc    Generate public share link
 * @route   POST /api/brands/:id/share
 * @access  Private
 */
exports.generateShareLink = catchAsync(async (req, res, next) => {
    const shareToken = crypto.randomBytes(24).toString('base64url');
    const shareLink = shareToken;

    const [brand] = await sql`
        UPDATE brands 
        SET share_link = ${shareLink}, is_public = true, updated_at = NOW()
        WHERE id = ${req.params.id} AND user_id = ${req.user.id}
        RETURNING *
    `;

    if (!brand) {
        return next(new AppError('Brand not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {
            shareLink: brand.share_link,
            isPublic: brand.is_public
        }
    });
});

/**
 * @desc    Get public brand by share link
 * @route   GET /api/public/brands/:shareLink
 * @access  Public
 */
exports.getPublicBrand = catchAsync(async (req, res, next) => {
    const [brand] = await sql`SELECT * FROM brands WHERE share_link = ${req.params.shareLink} AND is_public = true`;

    if (!brand) {
        return next(new AppError('Brand not found or link expired', 404));
    }

    res.status(200).json({
        success: true,
        data: brand
    });
});

/**
 * @desc    Generate AI Brand Guidelines for a brand
 * @route   POST /api/brands/:id/guidelines
 * @access  Private
 */
exports.generateGuidelines = catchAsync(async (req, res, next) => {
    const { industry, targetAudience, personality, colors, brandProfileOverride, logoId } = req.body;

    // Fetch existing brand
    const [brand] = await sql`
        SELECT * FROM brands WHERE id = ${req.params.id} AND user_id = ${req.user.id}
    `;
    if (!brand) return next(new AppError('Brand not found', 404));

    // Optionally fetch logo data from logo_history for accurate colors/fonts
    let logoData = null;
    const targetLogoId = logoId || brand.logo?.logoHistoryId;
    if (targetLogoId) {
        [logoData] = await sql`SELECT * FROM logo_history WHERE id = ${targetLogoId} AND user_id = ${req.user.id}`;
    }

    // Build brand context with logo data enrichment
    const brandContext = {
        brandName: brand.brand_name,
        industry: industry || brand.industry || 'General',
        targetAudience: targetAudience || '',
        personality: personality || '',
        colors: colors || '',
        logoUrl: brand.logo?.primaryLogoUrl || '',
        // Enrich with actual logo data from DB
        logoColors: logoData?.colors || null,
        logoFont: logoData?.fonts || null,
        logoStyle: logoData?.style || null,
        aiPrompt: logoData?.prompt || null,
        ...(brandProfileOverride || {})
    };

    // Generate guidelines using Gemini/OpenAI
    const guidelines = await generateBrandGuidelines(brandContext);

    // Save to brand record
    const [updatedBrand] = await sql`
        UPDATE brands
        SET guidelines = ${sql.json(guidelines)}, updated_at = NOW()
        WHERE id = ${req.params.id} AND user_id = ${req.user.id}
        RETURNING *
    `;

    res.status(200).json({
        success: true,
        message: 'Brand guidelines generated successfully',
        data: { guidelines, brand: updatedBrand }
    });
});

/**
 * @desc    Generate guidelines without requiring an existing brand (stateless)
 * @route   POST /api/brands/guidelines/generate
 * @access  Private
 */
exports.generateGuidelinesStateless = catchAsync(async (req, res, next) => {
    const { brandName, industry, targetAudience, personality, colors, logoUrl, aiPrompt, logoId } = req.body;

    if (!brandName) {
        return next(new AppError('brandName is required', 400));
    }

    // Optionally enrich with logo DB data
    let logoData = null;
    if (logoId) {
        [logoData] = await sql`SELECT * FROM logo_history WHERE id = ${logoId} AND user_id = ${req.user.id}`;
    }

    const brandContext = {
        brandName, industry, targetAudience, personality, colors, logoUrl,
        aiPrompt: aiPrompt || logoData?.prompt || null,
        logoColors: logoData?.colors || null,
        logoFont: logoData?.fonts || null,
        logoStyle: logoData?.style || null
    };
    const guidelines = await generateBrandGuidelines(brandContext);

    res.status(200).json({
        success: true,
        data: { guidelines }
    });
});

/**
 * @desc    Get cached brand guidelines by logo ID (stored at generation time)
 * @route   GET /api/brands/guidelines/:logoId
 * @access  Private
 */
exports.getGuidelinesByLogoId = catchAsync(async (req, res, next) => {
    const [logo] = await sql`
        SELECT id, brand_name, prompt, style, industry, colors, fonts, logo_url, metadata
        FROM logo_history
        WHERE id = ${req.params.logoId} AND user_id = ${req.user.id}
    `;

    if (!logo) return next(new AppError('Logo not found', 404));

    const cachedGuidelines = logo.metadata?.brand_guidelines || null;

    res.status(200).json({
        success: true,
        data: {
            cached: !!cachedGuidelines,
            guidelines: cachedGuidelines,
            logo: {
                id: logo.id,
                brand_name: logo.brand_name,
                logo_url: logo.logo_url,
                industry: logo.industry,
                style: logo.style,
                colors: logo.colors,
                fonts: logo.fonts,
                prompt: logo.prompt,
            }
        }
    });
});
