const axios = require('axios');
const { getConfig } = require('../config/env');
const { geminiMainModel, geminiMockupModel, geminiImageModel } = require('./llmService');

const config = getConfig();

/**
 * Generate Logo via External SDXL AI Service (FastAPI / ngrok model)
 * Automatically falls back to Gemini if the ngrok service is unavailable.
 *
 * Endpoint: POST /generate?prompt=...
 * Response:  { image_base64: "..." }
 */
exports.generateLogoAI = async (payload) => {
    // Build a rich prompt from brand context
    const parts = [
        payload.prompt,
        payload.brand_name ? `brand name "${payload.brand_name}"` : null,
        payload.industry ? `${payload.industry} industry` : null,
        payload.style ? `${payload.style} style` : null,
        payload.colors?.length ? `colors: ${payload.colors.join(', ')}` : null,
        'vector logo, white background, professional, clean, no text',
    ].filter(Boolean);
    const finalPrompt = parts.join(', ');

    // --- Try primary ngrok SDXL model first ---
    if (config.aiService?.url) {
        try {
            const result = await generateLogoViaSDXL(finalPrompt, config.aiService.url);
            return result;
        } catch (sdxlError) {
            console.warn(`⚠️  SDXL service failed: ${sdxlError.message}`);
            console.log('🔄 Falling back to Gemini image generation...');
        }
    } else {
        console.log('ℹ️  AI_SERVICE_URL not configured — using Gemini for logo generation.');
    }

    // --- Fallback: Gemini image generation ---
    return await generateLogoWithGemini(finalPrompt, payload);
};

/**
 * Generate 4 logo variants in parallel for a single brand.
 * Each variant uses a different visual style suffix.
 * Returns an array of { url, metadata, variantStyle } objects.
 */
exports.generateLogoVariants = async (basePrompt, brandCtx = {}) => {
    const brandName = brandCtx.brandName || brandCtx.brand_name || 'Brand';
    const industry  = brandCtx.industry || '';
    const colors    = brandCtx.colors || '';

    const styleVariants = [
        { style: 'geometric minimalist', suffix: 'clean geometric shapes, flat design, bold lines' },
        { style: 'gradient modern',      suffix: 'smooth color gradient, futuristic, vibrant' },
    ];

    const generateOne = async (variant) => {
        const prompt = [
            basePrompt,
            variant.suffix,
            industry ? `${industry} industry` : null,
            colors ? `colors: ${colors}` : null,
            'vector logo, white background, professional, no text',
        ].filter(Boolean).join(', ');

        try {
            // Try SDXL first, fall back to Gemini
            if (config.aiService?.url) {
                try {
                    const r = await generateLogoViaSDXL(prompt, config.aiService.url);
                    return { ...r, variantStyle: variant.style };
                } catch (_) { /* fall through */ }
            }
            const r = await generateLogoWithGemini(prompt, { brand_name: brandName });
            return { ...r, variantStyle: variant.style };
        } catch (err) {
            console.warn(`⚠️ Variant "${variant.style}" failed: ${err.message}`);
            return null;
        }
    };

    const results = await Promise.all(styleVariants.map(generateOne));
    return results.filter(Boolean);
};



/**
 * Primary: Generate logo via the ngrok-hosted SDXL FastAPI service
 */
async function generateLogoViaSDXL(prompt, serviceUrl) {
    const baseUrl = serviceUrl.replace(/\/$/, '');
    const aiEndpoint = `${baseUrl}/generate`;

    console.log(`🚀 Calling SDXL Service: POST ${aiEndpoint}?prompt=...`);
    console.log(`📝 Prompt: ${prompt.substring(0, 120)}...`);

    const response = await axios.post(
        `${aiEndpoint}?prompt=${encodeURIComponent(prompt)}`,
        null,
        {
            headers: { 'ngrok-skip-browser-warning': 'true' },
            timeout: 120000, // 2 mins — SDXL generation takes time
        }
    );

    const base64Data = response.data.image_base64;
    if (!base64Data || base64Data.length < 100) {
        throw new Error('Invalid response from SDXL Service: Missing or empty image_base64');
    }

    console.log(`✅ SDXL Logo generated! Size: ${Math.round(base64Data.length / 1024)}KB`);

    return {
        url: `data:image/png;base64,${base64Data}`,
        metadata: {
            prompt,
            provider: 'sdxl-fastapi-ngrok',
            endpoint: aiEndpoint,
        }
    };
}

/**
 * Fallback: Generate logo via Google Gemini image generation
 * Uses the Imagen model via @google/generative-ai SDK
 */
async function generateLogoWithGemini(prompt, payload) {
    if (!geminiImageModel) {
        throw new Error('Gemini Image Model is unavailable. Cannot generate logo.');
    }

    const brandName = payload.brand_name || 'Brand';
    console.log(`🤖 Generating logo with Gemini...`);
    console.log(`📝 Prompt: ${prompt.substring(0, 120)}...`);

    const logoPrompt = `Create a professional logo image: ${prompt}. The logo should have a clean white background, be visually striking, minimal, and suitable for a brand identity. Do not include any text in the image.`;

    const result = await geminiImageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: logoPrompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    // Find the image part
    const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
    if (!imagePart?.inlineData?.data) {
        throw new Error('Gemini did not return an image. Try rephrasing the brand description.');
    }

    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    console.log(`✅ Gemini Logo generated! Size: ${Math.round(base64Data.length / 1024)}KB`);

    return {
        url: `data:${mimeType};base64,${base64Data}`,
        metadata: {
            prompt,
            provider: 'gemini-imagen-fallback',
            model: 'gemini-2.5-flash-image',
        }
    };
}

exports.chatAI = async () => {
    throw new Error('Chat AI not supported via this service.');
};

/**
 * Generate a product mockup using Gemini image generation.
 * Places the brand/logo concept on a realistic scene for each template type.
 */
exports.generateMockupAI = async (payload) => {
    const { logo_url, template_type, brand_name } = payload;
    if (!geminiMockupModel) throw new Error('Gemini Mockup Model not initialized');

    const brandLabel = brand_name ? `"${brand_name}"` : 'the brand';

    const SCENE_PROMPTS = {
        businessCard: `A professional business card mockup lying on a dark marble desk surface. The card is white with a subtle shadow. It features ${brandLabel} logo centered on the front. The card has clean typography and elegant design. Photorealistic product photography, top-down angle, soft studio lighting, shallow depth of field.`,
        tshirt: `A premium white cotton T-shirt mockup displayed on a simple gray background. The shirt has ${brandLabel} logo printed with vibrant colors, centered on the chest area. Folded neatly or on a mannequin. Clean commercial product photography, soft shadows, professional fashion retail style.`,
        mug: `A white ceramic 11oz coffee mug mockup on a wooden coffee shop table. The mug features ${brandLabel} logo printed clearly on the front. A few coffee beans scattered nearby. Warm ambient lighting, cozy cafe atmosphere, shallow depth of field, professional product photography.`,
        website: `A modern web browser window on a MacBook laptop screen showing a clean landing page. The page header features ${brandLabel} logo in the top-left corner with a minimalist hero section and gradient background. Bright ambient lighting, realistic screen reflection, professional tech marketing style.`,
        socialMedia: `A polished social media post mockup for Instagram, 1080x1080 ratio. Features ${brandLabel} logo prominently centered with a gradient purple and blue background. The design is modern and engaging with subtle geometric patterns. Digital marketing campaign style, vibrant colors.`,
    };

    const scenePrompt = SCENE_PROMPTS[template_type] || `A professional product mockup featuring ${brandLabel} logo. Clean studio background, commercial photography style.`;

    const fullPrompt = `Generate a high-quality photorealistic product mockup image: ${scenePrompt} Make it look premium and professional. No placeholder text, no lorem ipsum.`;

    console.log(`🖼 Generating mockup (${template_type}) with Gemini...`);

    const result = await geminiMockupModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
    if (!imagePart?.inlineData?.data) {
        throw new Error('Gemini did not return a mockup image.');
    }

    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    console.log(`✅ Mockup (${template_type}) generated! Size: ${Math.round(base64Data.length / 1024)}KB`);

    // Upload to ImgBB for a permanent URL
    const axios = require('axios');
    let finalUrl = `data:${mimeType};base64,${base64Data}`;
    try {
        const imgbbRes = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            new URLSearchParams({ image: base64Data }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        finalUrl = imgbbRes.data.data.url;
    } catch (uploadErr) {
        console.warn('ImgBB upload failed, returning base64:', uploadErr.message);
    }

    return {
        url: finalUrl,
        metadata: { template_type, provider: 'gemini-imagen', model: 'gemini-2.5-flash-image' }
    };
};
