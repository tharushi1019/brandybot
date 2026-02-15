import api from './api';

const BRAND_API_URL = '/brands';

/**
 * Create a new brand
 * @param {Object} brandData 
 * @returns {Promise<Object>}
 */
export const createBrand = async (brandData) => {
    try {
        const response = await api.post(BRAND_API_URL, brandData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get all brands for the user
 * @returns {Promise<Object>}
 */
export const getUserBrands = async () => {
    try {
        const response = await api.get(BRAND_API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get brand by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getBrandById = async (id) => {
    try {
        const response = await api.get(`${BRAND_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update brand
 * @param {string} id 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const updateBrand = async (id, data) => {
    try {
        const response = await api.put(`${BRAND_API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Delete brand
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const deleteBrand = async (id) => {
    try {
        const response = await api.delete(`${BRAND_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


const guidelineService = {
    createBrand,
    getUserBrands,
    getBrandById,
    updateBrand,
    deleteBrand
};

export default guidelineService;
