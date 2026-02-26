const { isDevelopment } = require('../config/env');
const { logError } = require('../utils/logger');

/**
 * Async Error Catcher Wrapper
 * Eliminates try-catch blocks in controllers.
 * Usage: exports.myHandler = catchAsync(async (req, res, next) => { ... });
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    catchAsync
};
