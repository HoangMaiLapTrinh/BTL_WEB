import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Cấu hình axios mặc định
axios.defaults.withCredentials = true;

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const login = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, userData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const logout = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/logout`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/me`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await axios.put(`${API_URL}/auth/me/update`, userData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}; 