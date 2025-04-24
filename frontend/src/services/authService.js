import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

// Cấu hình axios mặc định
axios.defaults.withCredentials = true;

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const login = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, userData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const logout = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await axios.put(`${API_URL}/auth/me/update`, userData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}; 