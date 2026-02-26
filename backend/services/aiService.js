const axios = require('axios');
const { getConfig } = require('../config/env');

const config = getConfig();

/**
 * Generate Logo via External SDXL AI Service (FastAPI / Kaggle ngrok)
 *
 * Confirmed endpoint (from live OpenAPI spec test):
 *   POST /api/v1/generate/logo
 *   Body (JSON): { "prompt": "..." }
 *   Response: raw PNG binary (arraybuffer)
 */
exports.generateLogoAI = async (payload) => {
    if (!config.aiService || !config.aiService.url) {
        throw new Error('AI_SERVICE_URL not configured in environment variables');
    }

    // Strip any trailing slash to prevent double-slash in URL
    const baseUrl = config.aiService.url.replace(/\/$/, '');
    const aiEndpoint = `${baseUrl}/generate`;

    // Build a rich, descriptive prompt combining all available brand context
    const parts = [
        payload.prompt,
        payload.brand_name ? `brand name "${payload.brand_name}"` : null,
        payload.industry ? `${payload.industry} industry` : null,
        payload.style ? `${payload.style} style` : null,
        payload.colors?.length ? `colors: ${payload.colors.join(', ')}` : null,
        'vector logo, white background, professional, clean, no text',
    ].filter(Boolean);

    const finalPrompt = parts.join(', ');

    console.log(`🚀 Calling SDXL Service: POST ${aiEndpoint}`);
    console.log(`📝 Prompt: ${finalPrompt.substring(0, 120)}...`);

    // POST with prompt as query param — returns JSON { "image_base64": "..." }
    const response = await axios.post(
        `${aiEndpoint}?prompt=${encodeURIComponent(finalPrompt)}`,
        null, // No request body needed
        {
            headers: {
                'ngrok-skip-browser-warning': 'true'  // bypass ngrok browser interstitial
            },
            timeout: 120000, // 2 mins — SDXL generation takes time
        }
    );

    // Extract base64 image from the JSON response
    const base64Data = response.data.image_base64;

    if (!base64Data) {
        throw new Error('Invalid response from AI Service: Missing image_base64 field');
    }

    const dataUrl = `data:image/png;base64,${base64Data}`;

    console.log(`✅ Logo generated! Base64 size: ${Math.round(base64Data.length / 1024)}KB`);

    return {
        url: dataUrl,
        metadata: {
            prompt: finalPrompt,
            provider: 'external-sdxl-fastapi',
            endpoint: aiEndpoint,
        }
    };
};

exports.chatAI = async () => {
    throw new Error('Chat AI not supported via this service.');
};

exports.generateMockupAI = async () => {
    throw new Error('Mockup generation not supported via this service.');
};
