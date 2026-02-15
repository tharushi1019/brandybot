import api from './api';

const MOCKUP_API_URL = '/mockups';

/**
 * Generate a mockup
 * @param {string} logoUrl 
 * @param {string} type 
 * @returns {Promise<Object>}
 */
export const generateMockup = async (logoUrl, type) => {
    try {
        const response = await api.post(`${MOCKUP_API_URL}/generate`, { logoUrl, type });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get available mockup templates
 * @returns {Promise<Object>}
 */
export const getMockupTemplates = async () => {
    try {
        const response = await api.get(`${MOCKUP_API_URL}/templates`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const mockupService = {
    generateMockup,
    getMockupTemplates
};

export default mockupService;
