/**
 * Simple Logger Utility
 * Provides logging functionality for errors and info
 */

const { isDevelopment } = require('../config/env');

/**
 * Log error messages
 */
const logError = (error, req = null) => {
    const timestamp = new Date().toISOString();

    console.error('\n' + '='.repeat(80));
    console.error(`[${timestamp}] ERROR`);

    if (req) {
        console.error(`Method: ${req.method}`);
        console.error(`Path: ${req.path}`);
        console.error(`IP: ${req.ip}`);
    }

    console.error(`Message: ${error.message}`);

    if (isDevelopment() && error.stack) {
        console.error(`Stack: ${error.stack}`);
    }

    console.error('='.repeat(80) + '\n');
};

/**
 * Log info messages
 */
const logInfo = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`);
};

/**
 * Log warning messages
 */
const logWarning = (message) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARNING: ${message}`);
};

module.exports = {
    logError,
    logInfo,
    logWarning
};
