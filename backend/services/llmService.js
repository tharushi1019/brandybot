const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
require("dotenv").config();

let geminiModel = null;
let openaiClient = null;

// Branding Expert Persona
const SYSTEM_INSTRUCTION = `
You are **BrandyBot's Creative Director**, an expert AI branding consultant.
Your goal is to help the user define their brand identity through a friendly, professional interview.

**Your Capabilities:**
1.  **Analyze:** Ask clarifying questions about their industry, target audience, and desired "vibe" (e.g., minimalist, playful, luxury).
2.  **Advise:** Suggest color palettes, typography styles, and logo concepts based on their answers.
3.  **Output:** When you have enough information, summarize their brand strategy clearly.

**Rules:**
- Keep responses concise (under 3 sentences unless detailing a strategy).
- Be encouraging and creative.
- Do NOT generate images yourself; focus on the *concept* and *text description*.
- If the user asks for a logo, describe what it *should* look like in detail.
`;

// Initialize Gemini
if (process.env.GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });
        console.log("✅ Google Gemini AI Initialized");
    } catch (error) {
        console.error("❌ Failed to initialize Gemini:", error.message);
    }
}

// Initialize OpenAI
if (process.env.OPENAI_API_KEY) {
    try {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        console.log("✅ OpenAI Initialized");
    } catch (error) {
        console.error("❌ Failed to initialize OpenAI:", error.message);
    }
}

/**
 * Generate a response from the LLM
 */
const generateResponse = async (prompt, history = []) => {
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser: ${prompt}\nAssistant:`;

    if (geminiModel) {
        try {
            const result = await geminiModel.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Error:", error.message);
            // Fall through to OpenAI or fallback
        }
    }

    if (openaiClient) {
        try {
            const messages = [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...history,
                { role: "user", content: prompt }
            ];
            const completion = await openaiClient.chat.completions.create({
                messages,
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
        } catch (error) {
            console.error("OpenAI Error:", error.message);
        }
    }

    // Graceful fallback — don't throw, return a helpful message
    return "I'm having a little trouble thinking right now 🤔 — but I'm here to help! Try asking me about logo generation, brand guidelines, or mockups.";
};


/**
 * Generate a rich, detailed Stable Diffusion prompt from brand context.
 * Accepts full brand profile for maximum prompt quality.
 *
 * @param {Object} brandProfile - { brandName, tagline, industry, targetAudience, personality, colors, style }
 * @returns {Promise<Object>} - { sd_prompt, negative_prompt, summary }
 */
const generateImagePrompt = async (brandProfile) => {
    // Support both string input (legacy) and full brand profile object
    const isString = typeof brandProfile === 'string';
    const userContext = isString ? brandProfile : `
Brand Name: ${brandProfile.brandName || 'Unknown'}
Tagline: ${brandProfile.tagline || 'None'}
Industry: ${brandProfile.industry || 'General'}
Target Audience: ${brandProfile.targetAudience || 'General public'}
Brand Personality: ${brandProfile.personality || 'Professional'}
Preferred Colors: ${brandProfile.colors || 'Open to suggestions'}
Logo Style: ${brandProfile.style || 'Modern flat vector'}
    `.trim();

    const PROMPT_ENGINEER_INSTRUCTION = `
You are an expert Prompt Engineer for Stable Diffusion image generation, specializing in professional logo design.
Your task is to convert a brand profile into a highly detailed, optimized image generation prompt that produces a PROFESSIONAL, CLEAN logo.

**Critical Rules for Logo Generation:**
- Always include: "vector logo", "white background", "no text", "clean", "professional"
- Style keywords based on personality: minimalist=flat design, luxury=gold/silver metallic, playful=cartoon rounded
- The logo must be suitable for business use — no watermarks, no photorealistic elements
- Include specific color hex values when colors are mentioned

**Input:** A brand profile with name, industry, audience, personality, colors, and style.

**Output:** A STRICT JSON object with ONLY these fields:
- "sd_prompt": Highly detailed positive prompt (50-80 words) — include brand type, visual elements, style, colors, mood
- "negative_prompt": Elements to avoid — always include "text, letters, words, watermark, signature, blurry, low quality, realistic photo, human, people, busy background, gradient background"
- "summary": 1-sentence friendly confirmation to user

**Example output for a coffee brand:**
{
  "sd_prompt": "minimalist coffee cup logo icon, steam rising, warm amber and cream color palette, flat vector design, rounded modern shapes, white background, clean professional branding, simple geometric style, cafe business logo, bold silhouette",
  "negative_prompt": "text, letters, words, watermark, signature, blurry, low quality, realistic photo, human, people, busy background, gradient background, 3d render, complex details",
  "summary": "I'm generating a minimalist coffee logo with warm amber tones for you!"
}

RETURN ONLY THE JSON. NO MARKDOWN. NO EXTRA TEXT.
    `.trim();

    const fullPrompt = isString
        ? `${PROMPT_ENGINEER_INSTRUCTION}\n\nUser Description: ${userContext}`
        : `${PROMPT_ENGINEER_INSTRUCTION}\n\nBrand Profile:\n${userContext}`;

    try {
        if (geminiModel) {
            const result = await geminiModel.generateContent(fullPrompt);
            const text = await result.response.text();
            const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonText);
        }

        if (openaiClient) {
            const completion = await openaiClient.chat.completions.create({
                messages: [
                    { role: "system", content: PROMPT_ENGINEER_INSTRUCTION },
                    { role: "user", content: `Brand Profile:\n${userContext}` }
                ],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        }
    } catch (error) {
        console.error("Prompt Generation Error:", error);
        // Fallback default
        return {
            sd_prompt: "minimalist professional vector logo, clean design, white background, simple geometric shapes, business branding",
            negative_prompt: "text, letters, words, watermark, signature, blurry, low quality, realistic photo, human, people, busy background",
            summary: "I'm having trouble connecting to my creative brain — but I'll generate a clean professional logo for you!"
        };
    }

    throw new Error("No AI provider initialized.");
};

/**
 * Generate AI-powered Brand Guidelines text from brand context, synced with the Logo Prompt.
 *
 * @param {Object} brandData - { brandName, industry, targetAudience, personality, colors, logoUrl, aiPrompt }
 * @returns {Promise<Object>} - structured guidelines object
 */
const generateBrandGuidelines = async (brandData) => {
    const GUIDELINES_INSTRUCTION = `
You are an expert Brand Strategist and Creative Director.
Generate comprehensive brand guidelines for the provided brand profile.
IMPORTANT: A logo was already generated for this brand using a specific visual prompt. You MUST ensure your generated color palette, typography choices, and overall vibe exactly match the style described in the AI Logo Prompt provided in the profile.

Return a STRICT JSON object with these sections:
{
  "logoUsage": ["rule 1", "rule 2", "rule 3", "rule 4"],
  "colorPalette": {
    "primary": { "hex": "#XXXXXX", "name": "color name", "usage": "usage description" },
    "secondary": { "hex": "#XXXXXX", "name": "color name", "usage": "usage description" },
    "accent": { "hex": "#XXXXXX", "name": "color name", "usage": "usage description" }
  },
  "typography": {
    "primaryFont": "font name",
    "secondaryFont": "font name",
    "headingWeight": "700",
    "bodyWeight": "400",
    "rationale": "Why these fonts suit the brand"
  },
  "brandVoice": {
    "tone": ["adjective 1", "adjective 2", "adjective 3"],
    "guidelines": ["voice rule 1", "voice rule 2", "voice rule 3"],
    "examplePhrase": "An example tagline or message in brand voice"
  },
  "dosAndDonts": {
    "dos": ["do 1", "do 2", "do 3"],
    "donts": ["dont 1", "dont 2", "dont 3"]
  },
  "imagery": ["imagery style rule 1", "imagery style rule 2", "imagery style rule 3"]
}

Base everything on the brand profile. Make it specific and actionable — not generic.
RETURN ONLY THE JSON. NO MARKDOWN.
    `.trim();

    const brandContext = `
Brand Name: ${brandData.brandName}
Industry: ${brandData.industry || 'General'}
Target Audience: ${brandData.targetAudience || 'General public'}
Brand Personality: ${brandData.personality || 'Professional'}
Preferred Colors: ${brandData.colors || 'Not specified'}
AI Logo Prompt Used: ${brandData.aiPrompt || 'None provided'}
    `.trim();

    try {
        if (geminiModel) {
            const result = await geminiModel.generateContent(
                `${GUIDELINES_INSTRUCTION}\n\nBrand Profile:\n${brandContext}`
            );
            const text = await result.response.text();
            const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonText);
        }

        if (openaiClient) {
            const completion = await openaiClient.chat.completions.create({
                messages: [
                    { role: "system", content: GUIDELINES_INSTRUCTION },
                    { role: "user", content: `Brand Profile:\n${brandContext}` }
                ],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        }
    } catch (error) {
        console.error("Brand Guidelines Generation Error:", error);
        throw new Error("Failed to generate brand guidelines: " + error.message);
    }

    throw new Error("No AI provider initialized.");
};

module.exports = { generateResponse, generateImagePrompt, generateBrandGuidelines };
