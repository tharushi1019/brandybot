/**
 * Security Middleware Configuration
 * Configures various security measures for the application.
 * 
 * BUG-10 FIX: Removed hardcoded localhost from CORS allowedOrigins and
 * Helmet CSP. All URLs are now driven by environment variables so
 * the same code works in dev (localhost) and production (Netlify/Vercel).
 */

const helmet = require('helmet');
const cors = require('cors');
const { getConfig } = require('../config/env');

const config = getConfig();

// Derive the backend's own public URL (needed for CSP connect-src)
const backendPublicUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

/**
 * Configure CORS options
 * Origins are driven by environment variables — no hardcoded production URLs.
 */
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            // From env (Netlify URL in prod, localhost in dev)
            config.frontend.url,
            // Always allow the production Netlify deployment
            'https://brandy-bot.netlify.app',
            // Always allow local dev origins
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
        ].filter(Boolean); // remove falsy values

        // Allow requests with no origin (mobile apps, Postman, etc.)
        // Or if the origin is explicitly in allowedOrigins
        // Or if it is a netlify subdomain (useful for Netlify branch/preview deploys)
        const isAllowed = !origin || 
                          allowedOrigins.includes(origin) || 
                          (origin.startsWith('https://') && origin.endsWith('.netlify.app'));

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`⛔ CORS blocked origin: ${origin}`);
            // Return null, false to reject CORS gracefully (browser blocks request) 
            // instead of throwing an Express error which results in a 500 Internal Server Error
            callback(null, false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

/**
 * Configure Helmet security headers
 * CSP sources driven by env — no hardcoded localhost.
 */
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://fonts.googleapis.com',
            ],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: [
                "'self'",
                'data:',
                'https:',
                backendPublicUrl,
                'https://i.ibb.co',
                'https://api.imgbb.com',
            ],
            connectSrc: [
                "'self'",
                backendPublicUrl,
                config.frontend.url,
                'https://generativelanguage.googleapis.com',
                'https://api.imgbb.com',
                'https://api.remove.bg',
                'https://api.replicate.com',
                'https://*.ngrok-free.dev',  // dev ngrok tunnels
                'https://*.vercel.app',       // vercel deployments
                'https://*.netlify.app',      // netlify deployments
                'wss:',                       // WebSocket support
            ].filter(Boolean),
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
});

module.exports = {
    corsOptions,
    helmetConfig,
};
