/**
 * Error Handling Middleware
 * Global error handler for Express application (PostgreSQL / Supabase)
 */

const { isDevelopment } = require('../config/env');
const { logError } = require('../utils/logger');

/**
 * Handle 404 - Not Found
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logError(err, req);

    // Determine status code
    let statusCode = err.statusCode || res.statusCode || 500;

    // Prepare error response
    const errorResponse = {
        success: false,
        status: err.status || 'error',
        message: err.message || 'Internal Server Error',
    };

    // Add stack trace in development
    if (isDevelopment()) {
        errorResponse.stack = err.stack;
        errorResponse.error = err;
    }

    // Handle PostgreSQL-specific error codes (replaces old MongoDB handlers)
    if (err.code === '23505') {
        // Unique constraint violation (e.g., duplicate email)
        statusCode = 409;
        errorResponse.status = 'fail';
        errorResponse.message = 'A record with this value already exists.';
    }

    if (err.code === '23503') {
        // Foreign key constraint violation
        statusCode = 400;
        errorResponse.status = 'fail';
        errorResponse.message = 'Referenced record does not exist.';
    }

    if (err.code === '22P02') {
        // Invalid text representation (e.g., malformed UUID)
        statusCode = 400;
        errorResponse.status = 'fail';
        errorResponse.message = 'Invalid ID format.';
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorResponse.status = 'fail';
        errorResponse.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorResponse.status = 'fail';
        errorResponse.message = 'Token expired';
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

module.exports = {
    notFound,
    errorHandler
};
