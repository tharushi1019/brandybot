require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateEnv, getConfig } = require('./config/env');
const connectDB = require('./config/db');

// Validate environment variables
try {
    validateEnv();
} catch (error) {
    console.error('❌ Environment Validation Error:', error.message);
    process.exit(1);
}

const config = getConfig();

// Connect to MongoDB (only if URI is configured)
if (config.mongodb.uri && config.mongodb.uri !== 'mongodb://localhost:27017/brandybot') {
    connectDB();
} else {
    console.log('⚠️  MongoDB URI not configured - skipping database connection');
}

const app = express();

// Security Middleware
const morgan = require('morgan');
const { corsOptions, helmetConfig } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');

app.use(helmetConfig); // Security headers
app.use(cors(corsOptions)); // CORS configuration
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '10mb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter); // Rate limiting for API routes

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'BrandyBot API Server',
        version: '1.0.0',
        status: 'running'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    })
});

// Error Handling Middleware (must be last)
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 BrandyBot Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${config.env}`);
    console.log(`🌐 Frontend URL: ${config.frontend.url}`);
});

module.exports = app;
