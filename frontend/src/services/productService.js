import axios from 'axios';
import { API_URL } from './authService.js';

// Lấy tất cả sản phẩm
export const getProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/products/products`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Lỗi kết nối server');
    }
};

// Lấy chi tiết sản phẩm theo ID
export const getProductDetails = async (id) => {
    try {
        if (!id) throw new Error('ID sản phẩm không hợp lệ');
        const response = await axios.get(`${API_URL}/products/product/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Lỗi kết nối server');
    }
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (categoryId) => {
    try {
        const response = await axios.get(`${API_URL}/products/category/${categoryId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Lỗi kết nối server');
    }
}; 