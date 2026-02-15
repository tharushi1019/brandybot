import axios from 'axios';
import { auth } from '../firebaseConfig';

// Create Axios Instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // TODO: Use env variable import.meta.env.VITE_API_URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Errors (Optional: auto-logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access - potential token expiry');
    }
    return Promise.reject(error);
  }
);

export default api;
