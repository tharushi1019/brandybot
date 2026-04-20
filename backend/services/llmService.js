const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai"); // Used for Groq (OpenAI-compatible)
require("dotenv").config();

let geminiMainModel = null;
let geminiGuidelinesModel = null;
let geminiMockupModel = null;
let geminiImageModel = null;
let groqClient = null;

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

// Gemini Instances
geminiMainModel       = initGemini(mainKey);
geminiGuidelinesModel = initGemini(guidelinesKey);
geminiMockupModel     = initGemini(mockupKey, "gemini-2.5-flash-image");
geminiImageModel      = initGemini(mainKey, "gemini-2.5-flash-image");

if (geminiMainModel) console.log("✅ Gemini Main Agent Initialized (2.5-flash)");
if (geminiImageModel) console.log("✅ Gemini Image Model Initialized (2.5-flash-image)");
if (guidelinesKey !== mainKey) console.log("✅ Gemini Guidelines Key Initialized");
if (mockupKey !== mainKey) console.log("✅ Gemini Mockup Key Initialized");

// Groq fallback (OpenAI-compatible)
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
            // Fallback: If Main key fails but Guidelines key exists/works, swap it
            if (guidelinesKey && guidelinesKey !== mainKey) {
                 console.log("🔄 Attempting to use Guidelines Key as fallback for Main Agent...");
                 const fallbackModel = initGemini(guidelinesKey);
                 try {
                     await fallbackModel.generateContent("Hello!");
                     geminiMainModel = fallbackModel;
                     console.log("✅ Gemini Main Agent restored using Guidelines Key fallback.");
                     if (!activeApi) activeApi = "Gemini (Fallback Key)";
                 } catch (err) {
                     console.error("❌ Gemini Fallback check also FAILED.");
                 }
            }
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

    console.log("----------------------------------\n");
    return activeApi || "None (All APIs Failed)";
};

// ============================================================
// GENERAL CHAT RESPONSE
// ============================================================
const generateResponse = async (prompt, history = []) => {
    const historyMessages = Array.isArray(history)
        ? history.map(m => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: m.content }))
        : [];

    if (geminiMainModel) {
        try {
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

    if (groqClient) {
        try {
            const messages = [
                { role: "system", content: BRANDING_SYSTEM_INSTRUCTION },
                ...historyMessages,
                { role: "user", content: prompt }
            ];
            const completion = await groqClient.chat.completions.create({
                messages,
                model: "llama-3.3-70b-versatile",
            });
            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Groq Error in generateResponse:", error.message);
        }
    }

    return "I'm having a little trouble thinking right now 🤔 — but I'm here to help! Try asking me about logo generation, brand guidelines, or mockups.";
};

// ============================================================
// STABLE DIFFUSION PROMPT ENGINEERING
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

**Output:** STRICT JSON with these fields:
{
  "sd_prompt": "50 comma-separated descriptors covering icons, style, colors, composition, and technical quality",
  "negative_prompt": "comprehensive exclusion list (text, faces, blurry, etc.)",
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

    if (groqClient) {
        try {
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: PROMPT_ENGINEER_INSTRUCTION },
                    { role: "user", content: fullPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Groq Error generating prompt:", error.message);
        }
    }

    return {
        sd_prompt: "minimalist professional vector logo, clean geometry, white background, high resolution",
        negative_prompt: "text, letters, words, watermark, blurry, photo",
        summary: "Generating a clean professional logo for you!",
        suggestedColors: { primary: "#7C3AED", secondary: "#3B82F6", accent: "#F59E0B" }
    };
};

// ============================================================
// BRAND GUIDELINES GENERATOR
// ============================================================
const generateBrandGuidelines = async (brandData) => {
    const GUIDELINES_INSTRUCTION = `
You are an expert Brand Strategist and Creative Director.
Generate comprehensive brand guidelines for the provided brand profile in STRICT JSON format.
`.trim();

    const brandContext = `
Brand Name: ${brandData.brandName}
Industry: ${brandData.industry || 'General'}
Logo Colors: Primary=${brandData.logoColors?.primary || 'N/A'} Secondary=${brandData.logoColors?.secondary || 'N/A'} Accent=${brandData.logoColors?.accent || 'N/A'}
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

    if (groqClient) {
        try {
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: GUIDELINES_INSTRUCTION },
                    { role: "user", content: brandContext }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Groq Error generating guidelines:", error.message);
        }
    }

    return { error: "Guidelines generation failed" };
};

// ============================================================
// LOGO AGENT CONVERSATIONAL REPLY
// ============================================================
const generateLogoAgentReply = async ({ message, history = [], brandContext = {} }) => {
    const fullInstruction = `${LOGO_AGENT_SYSTEM_INSTRUCTION}\nKnown brand context: ${JSON.stringify(brandContext)}`;

    if (geminiMainModel) {
        try {
            const combinedPrompt = `${fullInstruction}\n\nChat History:\n${history.map(h => `${h.role}: ${h.parts ? h.parts[0].text : h.content}`).join('\n')}\n\nUser: ${message}\nAssistant:`;
            const result = await geminiMainModel.generateContent(combinedPrompt);
            let text = result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Error generating Logo Agent Reply:", error.message);
        }
    }

    if (groqClient) {
        try {
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: fullInstruction },
                    ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts ? h.parts[0].text : h.content })),
                    { role: "user", content: message }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Groq Error generating Logo Agent Reply:", error.message);
        }
    }

    return { 
        reply: "I'm having trouble connecting to my AI brain. Can we continue in a moment?",
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
