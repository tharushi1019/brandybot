/**
 * Model Index
 * Central export point for all database models
 */

const User = require('./User');
const LogoHistory = require('./LogoHistory');
const Brand = require('./Brand');

module.exports = {
    User,
    LogoHistory,
    Brand
};
