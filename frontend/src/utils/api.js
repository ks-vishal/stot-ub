import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add JWT token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
};

export const initiateTransport = async (transportData) => {
    const response = await api.post('/api/transport/initiate', transportData);
    return response.data;
};

export const getTransportHistory = async (organId) => {
    const response = await api.get(`/api/transport/${organId}`);
    return response.data;
};

export const verifyDelivery = async (verificationData) => {
    const response = await api.post('/api/transport/verify', verificationData);
    return response.data;
};

export default api; 