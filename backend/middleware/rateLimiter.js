/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests from a single IP or user ID
 */

const rateLimit = require('express-rate-limit');
// ipKeyGenerator handles IPv6 normalization correctly (required by express-rate-limit v7+)
const { ipKeyGenerator } = rateLimit;
const { getConfig } = require('../config/env');

const config = getConfig();

/**
 * Key generator: use authenticated user ID when available, else fall back to
 * the library's ipKeyGenerator which handles IPv6 normalization correctly.
 */
const userKeyGenerator = (req) => {
    if (req.user?.id) return `user_${req.user.id}`;
    if (req.user?.uid) return `user_${req.user.uid}`;
    return ipKeyGenerator(req); // IPv6-safe IP fallback
};

/**
 * General API rate limiter — raised to 500 req/15min per user
 */
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs || 15 * 60 * 1000,
    max: 500, // Raised significantly — frontend polls frequently for credits/history
    keyGenerator: userKeyGenerator,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS', // Skip preflight requests
});

/**
 * Strict rate limiter for expensive generation routes (logo gen, guidelines, mockups)
 */
const generationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 generation requests per 15 min is generous for our users
    keyGenerator: userKeyGenerator,
    message: {
        success: false,
        message: 'Too many generation requests. Please wait a moment before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    keyGenerator: (req) => ipKeyGenerator(req), // IPv6-safe, always by IP for auth
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    generationLimiter,
};
