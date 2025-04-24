import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BadgeCart.scss';
import axios from 'axios';
import { API_URL } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.js';

function BadgeCart() {
    const [cartCount, setCartCount] = useState(0);
    const { user } = useAuth();

    // Lấy số lượng sản phẩm trong giỏ hàng
    const updateCount = async () => {
        // Nếu người dùng chưa đăng nhập, số lượng = 0
        if (!user) {
            setCartCount(0);
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/cart`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            
            if (response.data.success && response.data.cart) {
                // Tính tổng số lượng sản phẩm trong giỏ hàng
                const totalItems = response.data.cart.items.reduce(
                    (sum, item) => sum + item.quantity, 0
                );
                setCartCount(totalItems);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
            setCartCount(0);
        }
    };

    useEffect(() => {
        // Gọi hàm updateCount ngay khi component mount và khi user thay đổi
        updateCount();
        
        // Thiết lập event listener để lắng nghe sự kiện cập nhật giỏ hàng
        window.addEventListener('cart-updated', updateCount);
        
        // Cleanup function
        return () => {
            window.removeEventListener('cart-updated', updateCount);
        };
    }, [user]);

    return (
        <Link to="/cart" className="badge-cart">
            <i className="fa-solid fa-cart-shopping"></i>
            {cartCount > 0 && (
                <span className="count" aria-label="Số lượng sản phẩm trong giỏ hàng">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}
        </Link>
    );
}

export default BadgeCart; 