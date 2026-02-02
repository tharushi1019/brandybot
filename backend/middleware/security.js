/**
 * Security Middleware Configuration
 * Configures various security measures for the application
 */

const helmet = require('helmet');
const cors = require('cors');
const { getConfig } = require('../config/env');

const config = getConfig();

/**
 * Configure CORS options
 */
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            config.frontend.url,
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

/**
 * Configure Helmet security headers
 */
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
});

module.exports = {
    corsOptions,
    helmetConfig
};
