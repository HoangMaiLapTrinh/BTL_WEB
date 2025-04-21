import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../../services/authService.js';

export const useHeaderLogic = () => {
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy thông tin người dùng từ localStorage
        const token = localStorage.getItem('token');
        if (token) {
            // Giả sử token chứa thông tin người dùng
            // Trong thực tế, bạn nên gọi API để lấy thông tin người dùng
            const userData = JSON.parse(atob(token.split('.')[1]));
            setUser(userData);
        }
    }, []);

    const toggleBrandDropdown = () => {
        setIsBrandDropdownOpen(!isBrandDropdownOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('token');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return {
        user,
        cartCount,
        isBrandDropdownOpen,
        toggleBrandDropdown,
        handleLogout
    };
};
