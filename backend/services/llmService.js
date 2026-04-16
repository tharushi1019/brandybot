const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
require("dotenv").config();

let geminiMainModel = null;
let geminiGuidelinesModel = null;
let geminiMockupModel = null;
let geminiImageModel = null;

let openaiClient = null;
let groqClient = null;
let openRouterClient = null;

// ============================================================
// SYSTEM INSTRUCTIONS
// ============================================================

const BRANDING_SYSTEM_INSTRUCTION = `
You are **BrandyBot**, an expert AI branding consultant and creative director.
Your goal is to help the user define their brand identity through a friendly, professional conversation.

**Your Capabilities:**
1. **Listen:** Carefully read the ENTIRE conversation history before responding. NEVER ask for information the user has already provided.
2. **Analyze:** Ask ONE follow-up question at a time about industry, target audience, or desired vibe (minimalist, playful, luxury, etc.).
3. **Advise:** Suggest color palettes, typography styles, and logo concepts based on their answers.
4. **Progress:** After 3-4 turns with enough brand info collected, guide the user toward creating their logo.

**Critical Rules:**
- NEVER re-ask for information already given in the conversation. Review the full history first.
- Keep responses concise (2-3 sentences max) — you are a chat widget, not an essay writer.
- Ask only ONE question per response. Never list multiple questions.
- Be encouraging, creative, and human.
- Only discuss branding, logos, colors, fonts, and business identity. Politely redirect off-topic questions.
- Do NOT generate images yourself — focus on brand strategy and text descriptions.
- If you have collected brandName + industry + style/vibe, suggest the user proceed to generate their logo.
`.trim();

const LOGO_AGENT_SYSTEM_INSTRUCTION = `
You are BrandyBot's AI Logo Design Agent. You are an expert brand strategist and visual designer.
Your job is to have a natural, friendly conversation with the user to understand their brand and logo needs, then trigger logo generation at the right time.

**Conversation Goals:**
Naturally discover these brand details through conversation:
- brandName: The name of the brand
- industry: What sector (technology, food, fashion, etc.)
- targetAudience: Who are the customers
- personality: Brand personality (modern, playful, luxury, minimalist, bold)
- colors: Preferred color palette or mood
- style: Visual style preference (flat, gradient, 3D, illustrative, geometric)
- description: Any specific visual concepts the user wants

**Conversation Rules:**
- Only discuss branding, logo design, and visual identity topics. Politely decline unrelated topics.
- Be warm, encouraging, and conversational. Never sound like a form.
- Don't ask all questions at once. Extract info naturally from what the user says.
- After 3-4 exchanges, you should have enough for a good logo.
- If the user says "generate", "make", "create", "build my logo" or similar — trigger generation.
- If you have enough brand context AND user wants to generate — set shouldGenerate to true.

**Output Format — STRICT JSON:**
{
  "reply": "Your conversational response to the user",
  "updatedBrandContext": { extracted brand fields object },
  "shouldGenerate": true or false
}

RETURN ONLY THE JSON. NO MARKDOWN. NO EXTRA TEXT.
`.trim();

// ============================================================
// INITIALIZE AI CLIENTS
// ============================================================

const initGemini = (apiKey, modelName = "gemini-2.5-flash") => {
    if (!apiKey) return null;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        return genAI.getGenerativeModel({ model: modelName });
    } catch (e) {
        console.error(`❌ Failed to init Gemini (${modelName}):`, e.message);
        return null;
    }
};

const mainKey       = process.env.GEMINI_MAIN_KEY || process.env.GEMINI_API_KEY;
const guidelinesKey = process.env.GEMINI_GUIDELINES_KEY || mainKey;
const mockupKey     = process.env.GEMINI_MOCKUP_KEY || mainKey;

geminiMainModel       = initGemini(mainKey);
geminiGuidelinesModel = initGemini(guidelinesKey);
geminiMockupModel     = initGemini(mockupKey, "gemini-2.5-flash-image");
geminiImageModel      = initGemini(mainKey, "gemini-2.5-flash-image");

if (geminiMainModel) console.log("✅ Gemini Main Agent Initialized (2.5-flash)");
if (geminiImageModel) console.log("✅ Gemini Image Model Initialized (2.5-flash-image)");
if (guidelinesKey !== mainKey) console.log("✅ Gemini Guidelines Key Initialized");
if (mockupKey !== mainKey) console.log("✅ Gemini Mockup Key Initialized");

if (process.env.OPENAI_API_KEY) {
    try {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        console.log("✅ OpenAI Initialized");
    } catch (error) {
        console.error("❌ Failed to initialize OpenAI:", error.message);
    }
} else {
    console.log("⚠️ OPENAI_API_KEY not found in environment.");
}

if (process.env.GROQ_API_KEY) {
    try {
        groqClient = new OpenAI({ 
            baseURL: "https://api.groq.com/openai/v1", 
            apiKey: process.env.GROQ_API_KEY 
        });
        console.log("✅ Groq Initialized");
    } catch (error) {
        console.error("❌ Failed to initialize Groq:", error.message);
    }
} else {
    console.log("⚠️ GROQ_API_KEY not found in environment.");
}

if (process.env.OPENROUTER_API_KEY) {
    try {
        openRouterClient = new OpenAI({ 
            baseURL: "https://openrouter.ai/api/v1", 
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:5173", // Optional, for OpenRouter rankings
                "X-Title": "BrandyBot", // Optional, for OpenRouter rankings
            }
        });
        console.log("✅ OpenRouter Initialized");
    } catch (error) {
        console.error("❌ Failed to initialize OpenRouter:", error.message);
    }
} else {
    console.log("⚠️ OPENROUTER_API_KEY not found in environment.");
}

// ============================================================
// STARTUP API TESTING
// ============================================================
const testAPIsOnStartup = async () => {
    console.log("\n--- AI API Startup Diagnostics ---");
    let activeApi = null;

    if (geminiMainModel) {
        try {
            console.log("⏳ Testing Gemini Main API...");
            await geminiMainModel.generateContent("Hello!");
            console.log("✅ Gemini Main API check: SUCCESS");
            if (!activeApi) activeApi = "Gemini";
        } catch (e) {
            console.error("❌ Gemini Main API check: FAILED ->", e.message);
        }
    }

    if (geminiGuidelinesModel && geminiGuidelinesModel !== geminiMainModel) {
        try {
            console.log("⏳ Testing Gemini Guidelines API...");
            await geminiGuidelinesModel.generateContent("Hello!");
            console.log("✅ Gemini Guidelines API check: SUCCESS");
        } catch (e) {
            console.error("❌ Gemini Guidelines API check: FAILED ->", e.message);
        }
    }
    
    if (groqClient) {
        try {
            console.log("⏳ Testing Groq API...");
            await groqClient.chat.completions.create({
                messages: [{ role: "user", content: "Hello!" }],
                model: "llama-3.3-70b-versatile",
            });
            console.log("✅ Groq API check: SUCCESS");
            if (!activeApi) activeApi = "Groq";
        } catch (e) {
            console.error("❌ Groq API check: FAILED ->", e.message);
        }
    }

    if (openRouterClient) {
        try {
            console.log("⏳ Testing OpenRouter API...");
            await openRouterClient.chat.completions.create({
                messages: [{ role: "user", content: "Hello!" }],
                model: "meta-llama/llama-3.3-70b-instruct:free",
            });
            console.log("✅ OpenRouter API check: SUCCESS");
            if (!activeApi) activeApi = "OpenRouter";
        } catch (e) {
            console.error("❌ OpenRouter API check: FAILED ->", e.message);
        }
    }

    if (openaiClient) {
        try {
            console.log("⏳ Testing OpenAI API...");
            await openaiClient.chat.completions.create({
                messages: [{ role: "user", content: "Hello!" }],
                model: "gpt-3.5-turbo",
            });
            console.log("✅ OpenAI API check: SUCCESS");
            if (!activeApi) activeApi = "OpenAI";
        } catch (e) {
            console.error("❌ OpenAI API check: FAILED ->", e.message);
        }
    }
    console.log("----------------------------------\n");
    return activeApi || "None (All APIs Failed)";
};

// ============================================================
// GENERAL CHAT RESPONSE
// ============================================================
const generateResponse = async (prompt, history = []) => {
    // Build OpenAI-format messages array with history
    const historyMessages = Array.isArray(history)
        ? history.map(m => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: m.content }))
        : [];

    if (geminiMainModel) {
        try {
            // Format history as a conversation transcript for Gemini
            const historyText = historyMessages.length > 0
                ? historyMessages.map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n') + '\n'
                : '';
            const fullPrompt = `${BRANDING_SYSTEM_INSTRUCTION}\n\n${historyText}User: ${prompt}\nAssistant:`;
            const result = await geminiMainModel.generateContent(fullPrompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini Error in generateResponse:", error.message);
        }
    }

    // Build messages array for OpenAI-compatible APIs
    const messages = [
        { role: "system", content: BRANDING_SYSTEM_INSTRUCTION },
        ...historyMessages,
        { role: "user", content: prompt }
    ];

    if (groqClient) {
        try {
            const completion = await groqClient.chat.completions.create({
                messages,
                model: "llama-3.3-70b-versatile",
            });
            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Groq Error in generateResponse:", error.message);
        }
    }

    if (openRouterClient) {
        try {
            const completion = await openRouterClient.chat.completions.create({
                messages,
                model: "meta-llama/llama-3.3-70b-instruct:free",
            });
            return completion.choices[0].message.content;
        } catch (error) {
            console.error("OpenRouter Error in generateResponse:", error.message);
        }
    }

    if (openaiClient) {
        try {
            const completion = await openaiClient.chat.completions.create({
                messages,
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
        } catch (error) {
            console.error("OpenAI Error in generateResponse:", error.message);
        }
    }

    return "I'm having a little trouble thinking right now 🤔 — but I'm here to help! Try asking me about logo generation, brand guidelines, or mockups.";
};

// ============================================================
// 50-LINE STABLE DIFFUSION PROMPT ENGINEERING  (F01)
// ============================================================
const generateImagePrompt = async (brandProfile) => {
    const isString = typeof brandProfile === 'string';
    const userContext = isString ? brandProfile : `
Brand Name: ${brandProfile.brandName || 'Unknown'}
Tagline: ${brandProfile.tagline || 'None'}
Industry: ${brandProfile.industry || 'General'}
Target Audience: ${brandProfile.targetAudience || 'General public'}
Brand Personality: ${brandProfile.personality || 'Professional'}
Preferred Colors: ${brandProfile.colors || 'Open to suggestions'}
Logo Style: ${brandProfile.style || 'Modern flat vector'}
Additional Description: ${brandProfile.description || ''}
    `.trim();

    const PROMPT_ENGINEER_INSTRUCTION = `
You are an elite Prompt Engineer for Stable Diffusion image generation, specializing in professional logo design.
Convert a brand profile into a HIGHLY DETAILED, OPTIMIZED 50-line image generation prompt that produces a PERFECT professional logo.

**Critical Requirements for the positive prompt (sd_prompt):**
- Must be 50 lines / entries long (comma-separated descriptors, one concept per line)
- Cover ALL of the following dimensions:
  1. Logo symbol / icon description (what the visual element is)
  2. Shape and geometry (circles, triangles, organic curves, etc.)
  3. Style descriptor (flat vector, minimalist, geometric, illustrative, etc.)
  4. Color palette (use specific hex values: primary, secondary, accent)
  5. Color mood and temperature (warm, cool, vibrant, muted)
  6. Line weight and stroke style (thick, hairline, bold, no outline)
  7. Composition (centered, asymmetric, contained in circle/shield/badge)
  8. Negative space usage (clever use of negative space)
  9. Typography hint (if any — usually "no text" for logos)
  10. Background (always: white background)
  11. Print readiness descriptors (scalable, vector quality, crisp edges)
  12. Lighting and shadow (flat, subtle shadow, no shadow)
  13. Industry visual language (what visual conventions for this industry)
  14. Target audience appeal (professional, youthful, luxurious, friendly)
  15. Brand personality embodiment (bold, elegant, playful, trustworthy)
  16. Technical quality modifiers (high resolution, clean lines, professional)
  17. Exclusion hints in positive (simple, uncluttered, iconic)

**Negative prompt requirements:**
- Comprehensive list covering: realistic photo, human faces, body parts, text, letters, words, numbers, signatures, watermarks, copyright, blur, noise, grain, low quality, JPEG artifacts, complex backgrounds, gradients backgrounds, multiple logos, collage, busy composition, 3D render, photorealism, stock photo, clip art style, amateur, childish (unless brand calls for it), pixelated, distorted

**Output:** STRICT JSON with these fields:
{
  "sd_prompt": "50 comma-separated descriptors covering all dimensions above",
  "negative_prompt": "comprehensive exclusion list",
  "summary": "1-sentence friendly confirmation to user",
  "suggestedColors": {
    "primary": "#HEXCODE",
    "secondary": "#HEXCODE",
    "accent": "#HEXCODE"
  }
}

RETURN ONLY THE JSON. NO MARKDOWN. NO EXTRA TEXT.
    `.trim();

    const fullPrompt = `${PROMPT_ENGINEER_INSTRUCTION}\n\nBrand Profile:\n${userContext}`;

    if (geminiMainModel) {
        try {
            const result = await geminiMainModel.generateContent(fullPrompt);
            const text = result.response.text();
            const jsonText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("Gemini Error generating prompt:", error.message);
        }
    }

    const messages = [
        { role: "system", content: PROMPT_ENGINEER_INSTRUCTION },
        { role: "user", content: `Brand Profile:\n${userContext}` }
    ];

    if (groqClient) {
        try {
            const completion = await groqClient.chat.completions.create({
                messages,
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Groq Error generating prompt:", error.message);
        }
    }

    if (openRouterClient) {
        try {
            const completion = await openRouterClient.chat.completions.create({
                messages,
                model: "meta-llama/llama-3.3-70b-instruct:free",
            });
            const text = completion.choices[0].message.content;
            const jsonText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("OpenRouter Error generating prompt:", error.message);
        }
    }

    if (openaiClient) {
        try {
            const completion = await openaiClient.chat.completions.create({
                messages,
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("OpenAI Error generating prompt:", error.message);
        }
    }

    console.error("Prompt Generation Error: All AI providers failed or none configured.");
    return {
        sd_prompt: [
            "minimalist professional vector logo",
            "clean geometric symbol",
            "flat design",
            "white background",
            "crisp edges",
            "scalable vector quality",
            "simple iconic mark",
            "bold primary color",
            "complementary accent color",
            "centered composition",
            "no text",
            "no letters",
            "no watermark",
            "professional business branding",
            "elegant negative space",
            "print ready",
            "high resolution",
            "sharp lines",
            "balanced proportions",
            "timeless design"
        ].join(", "),
        negative_prompt: "text, letters, words, watermark, signature, blurry, low quality, realistic photo, human, people, busy background, gradient background, 3d render, complex details, noise, jpeg artifacts",
        summary: "Generating a clean professional logo for you!",
        suggestedColors: { primary: "#7C3AED", secondary: "#3B82F6", accent: "#F59E0B" }
    };
};

// ============================================================
// BRAND GUIDELINES GENERATOR  (F03 upgrade)
// ============================================================
const generateBrandGuidelines = async (brandData) => {
    const GUIDELINES_INSTRUCTION = `
You are an expert Brand Strategist and Creative Director.
Generate comprehensive brand guidelines for the provided brand profile.
IMPORTANT: A logo was already generated for this brand. Your color palette, typography, and vibe MUST exactly match the visual described in the AI Logo Prompt and logo colors provided.

Return a STRICT JSON:
{
  "logoUsage": ["rule 1", "rule 2", "rule 3", "rule 4"],
  "colorPalette": {
    "primary":   { "hex": "#XXXXXX", "name": "color name", "usage": "usage description" },
    "secondary": { "hex": "#XXXXXX", "name": "color name", "usage": "usage description" },
    "accent":    { "hex": "#XXXXXX", "name": "color name", "usage": "usage description" }
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
RETURN ONLY THE JSON. NO MARKDOWN.
    `.trim();

    const brandContext = `
Brand Name: ${brandData.brandName}
Industry: ${brandData.industry || 'General'}
Target Audience: ${brandData.targetAudience || 'General public'}
Brand Personality: ${brandData.personality || 'Professional'}
Preferred Colors: ${brandData.colors || 'Not specified'}
Actual Logo Colors (from DB): Primary=${brandData.logoColors?.primary || 'N/A'} Secondary=${brandData.logoColors?.secondary || 'N/A'} Accent=${brandData.logoColors?.accent || 'N/A'}
Logo Style Used: ${brandData.logoStyle || 'Modern'}
AI Logo Prompt Used: ${brandData.aiPrompt || 'None provided'}
Logo Font (from DB): ${brandData.logoFont || 'Not specified'}
    `.trim();

    if (geminiGuidelinesModel) {
        try {
            const result = await geminiGuidelinesModel.generateContent(`${GUIDELINES_INSTRUCTION}\n\nBrand Profile:\n${brandContext}`);
            const text = result.response.text();
            const jsonText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("Gemini Error generating guidelines:", error.message);
        }
    }

    const messages = [
        { role: "system", content: GUIDELINES_INSTRUCTION },
        { role: "user", content: `Brand Profile:\n${brandContext}` }
    ];

    if (groqClient) {
        try {
            const completion = await groqClient.chat.completions.create({
                messages,
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Groq Error generating guidelines:", error.message);
        }
    }

    if (openRouterClient) {
        try {
            const completion = await openRouterClient.chat.completions.create({
                messages,
                model: "meta-llama/llama-3.3-70b-instruct:free",
            });
            const text = completion.choices[0].message.content;
            const jsonText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("OpenRouter Error generating guidelines:", error.message);
        }
    }

    if (openaiClient) {
        try {
            const completion = await openaiClient.chat.completions.create({
                messages,
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("OpenAI Error generating guidelines:", error.message);
        }
    }

    console.error("Brand Guidelines Generation Error: All AI providers failed.");
    // Graceful fallback
    return {
        logoUsage: ["Use the logo on white or light backgrounds.", "Maintain clear space around the logo.", "Never stretch or rotate the logo.", "Use only approved color variations."],
        colorPalette: {
            primary:   { hex: brandData.logoColors?.primary || "#7C3AED", name: "Brand Purple", usage: "Primary brand color for headers and CTAs" },
            secondary: { hex: brandData.logoColors?.secondary || "#3B82F6", name: "Brand Blue", usage: "Secondary elements and links" },
            accent:    { hex: brandData.logoColors?.accent || "#F59E0B", name: "Brand Amber", usage: "Highlights, badges and call-to-action" }
        },
        typography: { primaryFont: brandData.logoFont?.primary || "Inter", secondaryFont: "Helvetica", headingWeight: "700", bodyWeight: "400", rationale: "Clean, modern readability across all media." },
        brandVoice: { tone: ["Professional", "Friendly", "Creative"], guidelines: ["Speak directly to your audience.", "Use simple, clear language.", "Be encouraging and positive."], examplePhrase: "Building brands that matter." },
        dosAndDonts: { dos: ["Use consistent colors.", "Keep layouts clean.", "Use the brand voice consistently."], donts: ["Don't stretch the logo.", "Don't use low-contrast text.", "Don't use off-brand fonts."] },
        imagery: ["Use clean, minimal imagery.", "Prefer flat illustrations over photography.", "Ensure all imagery aligns with the brand color palette."]
    };
};

// ============================================================
// LOGO AGENT CONVERSATIONAL REPLY  (F08)
// ============================================================
const generateLogoAgentReply = async ({ message, history = [], brandContext = {} }) => {
    const contextSummary = Object.keys(brandContext).length > 0
        ? `\n\nCurrent known brand context: ${JSON.stringify(brandContext)}`
        : '';

    const fullInstruction = `${LOGO_AGENT_SYSTEM_INSTRUCTION}${contextSummary}`;
    const userMessage = message;

    if (geminiMainModel) {
        try {
            let formattedHistory = [];
            if (history.length > 0) {
                 formattedHistory = history.length > 1 ? history.slice(0, -1) : [];
            }
            const combinedPrompt = `${fullInstruction}\n\nChat History:\n${formattedHistory.map(h => `${h.role}: ${h.parts ? h.parts[0].text : h.content}`).join('\n')}\n\nUser: ${userMessage}\nAssistant:`;
            
            const result = await geminiMainModel.generateContent(combinedPrompt);
            let text = result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Error generating Logo Agent Reply:", error.message);
        }
    }

    const messages = [
        { role: "system", content: fullInstruction },
        ...history.map(h => ({
            role: h.parts ? (h.role === 'model' ? 'assistant' : 'user') : h.role,
            content: h.parts ? h.parts[0].text : h.content
        })),
        { role: "user", content: userMessage }
    ];

    if (groqClient) {
        try {
            const completion = await groqClient.chat.completions.create({
                messages,
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Groq Error generating Logo Agent Reply:", error.message);
        }
    }

    if (openRouterClient) {
        try {
            const completion = await openRouterClient.chat.completions.create({
                messages,
                model: "meta-llama/llama-3.3-70b-instruct:free",
            });
            const text = completion.choices[0].message.content;
            const jsonText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("OpenRouter Error generating Logo Agent Reply:", error.message);
        }
    }

    if (openaiClient) {
        try {
            const completion = await openaiClient.chat.completions.create({
                messages,
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("OpenAI Error generating Logo Agent Reply:", error.message);
        }
    }

    console.error("Logo Agent Reply Error: All AI providers failed.");
    return {
        reply: "I'm having a bit of trouble connecting to the AI brain right now 😟 Could you tell me more about your brand in the meantime?",
        updatedBrandContext: brandContext,
        shouldGenerate: false
    };
};

module.exports = {
    generateResponse,
    generateImagePrompt,
    generateBrandGuidelines,
    generateLogoAgentReply,
    testAPIsOnStartup,
    geminiMainModel,
    geminiGuidelinesModel,
    geminiMockupModel,
    geminiImageModel
};
