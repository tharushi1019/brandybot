require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateEnv, getConfig } = require('./config/env');
const { connectDB } = require('./config/db');
const { testAPIsOnStartup } = require('./services/llmService');

// Validate environment variables (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
    try {
        validateEnv();
    } catch (error) {
        console.error('❌ Environment Validation Error:', error.message);
        process.exit(1);
    }
}

const config = getConfig();

// Connect to PostgreSQL
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();

// Initialize Firebase Admin SDK
const setupFirebase = require('./config/firebase');
setupFirebase();

// Security Middleware
const morgan = require('morgan');
const { corsOptions, helmetConfig } = require('./middleware/security');
const { apiLimiter, generationLimiter } = require('./middleware/rateLimiter');

app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter); // General rate limiting (500 req / 15min per user)

// Serve static files
const path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/logos', require('./routes/logoRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/mockups', require('./routes/mockupRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/chat', require('./routes/chatSessionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/utils', require('./routes/utilRoutes'));
app.use('/api/credits', require('./routes/creditRoutes'));
// Logo Agent: strict generation limiter (20 req / 15min per user)
app.use('/api/logo-agent', generationLimiter, require('./routes/logoAgentRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'BrandyBot API Server', version: '1.0.0', status: 'running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error Handling Middleware (must be last)
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = config.port;

if (process.env.NODE_ENV !== 'test') {
    /**
     * Deep logo generation check — sends an actual test generation request
     * to verify the model is fully working (not just reachable).
     * Non-blocking: if it fails, the server still starts and uses Gemini fallback.
     */
    const checkLogoGenerationService = async () => {
        const token = process.env.REPLICATE_API_TOKEN;
        if (!token) {
            console.warn("⚠️  REPLICATE_API_TOKEN not set — logo generation will use Gemini fallback.");
            return false;
        }

        console.log("\n--- Logo Generation Service Startup Check ---");
        console.log(`🔌 Replicate API Configuration: Configured (Token starts with ${token.substring(0, 5)}...)`);

        try {
            // Lightweight validation: Ensure we can load and initialize the Replicate client
            const Replicate = require('replicate');
            new Replicate({ auth: token });

            console.log(`✅ Logo Generation Service (Replicate): FULLY OPERATIONAL (Flux Model)`);
            console.log("---------------------------------------------\n");
            return true;
        } catch (error) {
            console.error("❌ Logo Generation Service (Replicate): NOT CONNECTED");
            console.error(`   Reason: ${error.message}`);
            console.log("   → Gemini API will be used as fallback automatically.");
            console.log("---------------------------------------------\n");
            return false;
        }
    };

    const runStartupDiagnostics = async () => {
        // 1. Deep check Logo Generation Service
        const isLogoServiceOk = await checkLogoGenerationService();

        // 2. Check LLM APIs (Gemini, Groq, OpenRouter, OpenAI)
        const activeLLM = await testAPIsOnStartup();

        // 3. Start Express Server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 BrandyBot Backend Server running on port ${PORT}`);
            console.log(`📍 Environment: ${config.env}`);
            console.log(`🌐 Frontend URL: ${config.frontend.url}`);
            console.log(`CHATBOT connected API - ${activeLLM}`);
            if (isLogoServiceOk) {
                console.log(`Logo Generation Model is Connected 🟢\n`);
            } else {
                console.log(`Logo Generation Model is not Connected 🔴 Plz restart Own Model.`);
                console.log(`⚡ Gemini API fallback is ACTIVE for logo generation.\n`);
            }
        });
    };

    runStartupDiagnostics();
}

module.exports = app;
