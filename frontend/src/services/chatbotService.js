import api from './api';

const CHAT_API_URL = '/chat';

/**
 * Send a message to the chatbot
 * @param {string} message 
 * @param {string} context 
 * @returns {Promise<Object>}
 */
export const sendMessage = async (message, context) => {
    try {
        const response = await api.post(`${CHAT_API_URL}/message`, { message, context });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const chatbotService = {
    sendMessage
};

export default chatbotService;
