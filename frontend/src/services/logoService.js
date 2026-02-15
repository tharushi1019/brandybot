import api from './api';

const LOGO_API_URL = '/logos';

/**
 * Generate a new logo
 * @param {Object} data - { brandName, prompt, style, industry, colors }
 * @returns {Promise<Object>} - The generated logo data
 */
export const generateLogo = async (data) => {
    try {
        const response = await api.post(`${LOGO_API_URL}/generate`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get user's logo history
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - List of logos with pagination
 */
export const getLogoHistory = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`${LOGO_API_URL}/history`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get a specific logo by ID
 * @param {string} id - Logo ID
 * @returns {Promise<Object>} - Logo details
 */
export const getLogoById = async (id) => {
    try {
        const response = await api.get(`${LOGO_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Rate a logo
 * @param {string} id - Logo ID
 * @param {number} rating - Rating (1-5)
 * @returns {Promise<Object>} - Updated logo data
 */
export const rateLogo = async (id, rating) => {
    try {
        const response = await api.post(`${LOGO_API_URL}/${id}/rate`, { rating });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const logoService = {
    generateLogo,
    getLogoHistory,
    getLogoById,
    rateLogo
};

export default logoService;
