/**
 * Environment Variable Validator
 * Validates and provides access to environment variables
 */

const requiredEnvVars = {
    development: [
        'NODE_ENV',
        'PORT',
        'FRONTEND_URL'
    ],
    production: [
        'NODE_ENV',
        'PORT',
        'MONGODB_URI',
        'FRONTEND_URL',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL'
    ]
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If required variables are missing
 */
const validateEnv = () => {
    const env = process.env.NODE_ENV || 'development';
    const required = requiredEnvVars[env] || requiredEnvVars.development;

    const missing = required.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            `Please check your .env file and ensure all required variables are set.`
        );
    }

    console.log(`✅ Environment variables validated for ${env} mode`);
};

/**
 * Get environment configuration
 */
const getConfig = () => {
    return {
        env: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT, 10) || 5000,
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/brandybot'
        },
        frontend: {
            url: process.env.FRONTEND_URL || 'http://localhost:5173'
        },
        firebase: {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'dev-secret-change-in-production'
        },
        aiService: {
            url: process.env.AI_SERVICE_URL || 'http://localhost:8000'
        },
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
        }
    };
};

/**
 * Check if running in production
 */
const isProduction = () => {
    return process.env.NODE_ENV === 'production';
};

/**
 * Check if running in development
 */
const isDevelopment = () => {
    return process.env.NODE_ENV !== 'production';
};

module.exports = {
    validateEnv,
    getConfig,
    isProduction,
    isDevelopment
};
