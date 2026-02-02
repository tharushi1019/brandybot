/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests from a single IP
 */

const rateLimit = require('express-rate-limit');
const { getConfig } = require('../config/env');

const config = getConfig();

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs, // 15 minutes by default
    max: config.rateLimit.maxRequests, // 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter
};
