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
    const statusCode = err.statusCode || res.statusCode || 500;

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

    // Handle specific error types
    if (err.name === 'ValidationError') {
        errorResponse.message = 'Validation Error';
        errorResponse.errors = Object.values(err.errors).map(e => e.message);
    }

    if (err.name === 'CastError') {
        errorResponse.message = 'Invalid ID format';
    }

    if (err.code === 11000) {
        errorResponse.message = 'Duplicate field value entered';
    }

    if (err.name === 'JsonWebTokenError') {
        errorResponse.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        errorResponse.message = 'Token expired';
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Catcher Wrapper
 * Eliminates try-catch blocks in controllers
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    notFound,
    errorHandler,
    catchAsync
};
