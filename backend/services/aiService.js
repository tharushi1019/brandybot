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

    // --- Try primary Replicate model first ---
    const token = config.aiService?.replicateToken || process.env.REPLICATE_API_TOKEN;
    if (token) {
        try {
            const result = await generateLogoViaReplicate(finalPrompt, 1);
            return result;
        } catch (replicateError) {
            console.warn(`⚠️  Replicate service failed: ${replicateError.message}`);
            console.log('🔄 Falling back to Gemini image generation...');
        }
    } else {
        console.log('ℹ️  REPLICATE_API_TOKEN not configured — using Gemini for logo generation.');
    }

    // --- Fallback: Gemini image generation ---
    return await generateLogoWithGemini(finalPrompt, payload);
};

/**
 * Generate exactly 2 logo variants for a single brand.
 * Returns an array of { url, metadata, variantStyle } objects.
 */
exports.generateLogoVariants = async (basePrompt, brandCtx = {}) => {
    const brandName = brandCtx.brandName || brandCtx.brand_name || 'Brand';
    const industry  = brandCtx.industry || '';
    const colors    = brandCtx.colors || '';

    // We only need one combined prompt for the improved Replicate service which returns multiple images
    const finalPrompt = [
        basePrompt,
        industry ? `${industry} industry` : null,
        colors ? `colors: ${colors}` : null,
        'vector logo, white background, professional, no text',
    ].filter(Boolean).join(', ');

    try {
        // 1. Try Replicate first
        const token = config.aiService?.replicateToken || process.env.REPLICATE_API_TOKEN;
        if (token) {
            try {
                const results = await generateLogoViaReplicate(finalPrompt, 2);
                if (results && results.length >= 2) {
                    return [
                        { ...results[0], variantStyle: 'Variant 1' },
                        { ...results[1], variantStyle: 'Variant 2' }
                    ];
                }
            } catch (err) {
                console.warn(`⚠️ Replicate service failed: ${err.message}`);
            }
        }

        // 2. Fallback: Gemini (call twice to get 2 variants)
        console.log('🔄 Falling back to Gemini for 2-variant generation...');
        const [r1, r2] = await Promise.all([
            generateLogoWithGemini(finalPrompt + ', style geometric minimalist', { brand_name: brandName }),
            generateLogoWithGemini(finalPrompt + ', style gradient modern', { brand_name: brandName })
        ]);

        return [
            { ...r1, variantStyle: 'Gemini Variant 1' },
            { ...r2, variantStyle: 'Gemini Variant 2' }
        ].filter(Boolean);

    } catch (err) {
        console.error('❌ Logo generation failed entirely:', err.message);
        throw err;
    }
};

/**
 * Helper to download an image from a URL and convert it to a base64 Data URL.
 */
async function convertUrlToBase64(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    let mimeType = response.headers['content-type'] || 'image/webp';
    if (mimeType === 'application/octet-stream') {
        mimeType = 'image/webp';
    }
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * Primary: Generate logos via Replicate using Flux dev LoRA model
 * Supports generating multiple images in one call.
 */
async function generateLogoViaReplicate(prompt, numOutputs = 1) {
    const Replicate = require('replicate');
    const token = config.aiService?.replicateToken || process.env.REPLICATE_API_TOKEN;
    if (!token) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    const replicate = new Replicate({
        auth: token,
    });

    console.log(`🚀 Calling Replicate Service with prompt: "${prompt.substring(0, 120)}..."`);
    console.log(`🔢 Requesting ${numOutputs} outputs...`);

    const output = await replicate.run(
        "tharushi1019/brandibot-model:d383ee425705d765420493ff450e778b95594f46f1598aaf8f34201e65664714",
        {
            input: {
                prompt: prompt,
                model: "dev",
                go_fast: false,
                lora_scale: 1,
                megapixels: "1",
                num_outputs: numOutputs,
                aspect_ratio: "1:1",
                output_format: "webp",
                guidance_scale: 3,
                output_quality: 80,
                prompt_strength: 0.8,
                extra_lora_scale: 1,
                num_inference_steps: 28
            }
        }
    );

    console.log('Replicate raw output:', output);

    if (!output || !output.length) {
        throw new Error('No images returned from Replicate Service');
    }

    // Convert output URLs to base64 Data URLs to maintain absolute backward compatibility
    const results = [];
    for (let i = 0; i < output.length; i++) {
        // Output can be a string URL or an object with .url() depending on the SDK version/behavior
        const urlStr = typeof output[i] === 'string' 
            ? output[i] 
            : (typeof output[i].url === 'function' ? output[i].url() : output[i].toString());
            
        console.log(`📥 Downloading and converting image ${i + 1} from Replicate: ${urlStr}`);
        const base64DataUrl = await convertUrlToBase64(urlStr);
        results.push({
            url: base64DataUrl,
            metadata: {
                prompt,
                provider: 'replicate',
                model: 'tharushi1019/brandibot-model',
                variant_index: i
            }
        });
    }

    return numOutputs === 1 ? results[0] : results;
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
 * Generate a transparent typography logo lockup via Python AI Service.
 */
exports.generateLogoLockupAI = async (payload) => {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    console.log(`🤖 Generating logo typography lockup via Python AI Service: ${aiServiceUrl}`);

    try {
        const response = await axios.post(`${aiServiceUrl}/api/v1/generate/lockup`, {
            logo_url:          payload.logoUrl,
            brand_name:        payload.brandName,
            tagline:           payload.tagline || '',
            layout:            payload.layout || 'vertical',
            font_family:       payload.fontFamily || 'Inter',
            primary_color:     payload.primaryColor || '#000000',
            secondary_color:   payload.secondaryColor || '#666666',
            font_size_name:    payload.fontSizeName || 48,
            font_size_tagline: payload.fontSizeTagline || 24,
            gap:               payload.gap || 20
        });

        return response.data;
    } catch (error) {
        console.error('❌ Python lockup service failed:', error.message);
        if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
            throw new Error('Python AI service is offline. Please make sure to start it by running "python main.py" inside the "ai-service" folder.');
        }
        throw new Error(error.response?.data?.detail || 'Lockup generation service failed');
    }
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
