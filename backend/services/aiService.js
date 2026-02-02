const axios = require('axios');
const { getConfig } = require('../config/env');

const config = getConfig();
const AI_SERVICE_URL = config.aiService.url || 'http://localhost:8000';

const aiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 30000 // 30 seconds timeout for AI generation
});

/**
 * Generate Logo via AI Service
 */
exports.generateLogoAI = async (payload) => {
    try {
        const response = await aiClient.post('/api/v1/generate/logo', payload);
        return response.data;
    } catch (error) {
        console.error('AI Service Error (Logo):', error.message);
        throw new Error('AI Service unavailable or failed to generate logo');
    }
};

/**
 * Chat with AI Service
 */
exports.chatAI = async (payload) => {
    try {
        const response = await aiClient.post('/api/v1/generate/chat', payload);
        return response.data;
    } catch (error) {
        console.error('AI Service Error (Chat):', error.message);
        throw new Error('AI Service unavailable');
    }
};

/**
 * Generate Mockup via AI Service
 */
exports.generateMockupAI = async (payload) => {
    try {
        const response = await aiClient.post('/api/v1/generate/mockup', payload);
        return response.data;
    } catch (error) {
        console.error('AI Service Error (Mockup):', error.message);
        throw new Error('AI Service unavailable or failed to generate mockup');
    }
};
