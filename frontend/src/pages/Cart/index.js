import React, { useState, useEffect } from 'react';
import * as styles from './Cart.module.scss';
import classNames from 'classnames/bind';
import '@fortawesome/fontawesome-free/css/all.min.css';
import emptyCartImage from '../../img/empty-cart.webp';
import { showToast } from '../../components/Toast/index.js';
import axios from 'axios';
import { API_URL } from '../../services/authService.js';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Kiểm tra đăng nhập và lấy dữ liệu giỏ hàng
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                // Kiểm tra xác thực
                const authResponse = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (authResponse.data.success) {
                    setIsAuthenticated(true);
                    // Sau khi xác thực thành công, lấy giỏ hàng
                    fetchCart(token);
                } else {
                    setIsAuthenticated(false);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Lỗi xác thực:', error);
                setIsAuthenticated(false);
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Lấy dữ liệu giỏ hàng từ API
    const fetchCart = async (token) => {
        try {
            const response = await axios.get(`${API_URL}/cart`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data.success) {
                // Chuyển đổi dữ liệu từ API để phù hợp với format hiển thị
                const formattedItems = response.data.cart.items.map(item => ({
                    id: item._id,
                    productId: item.product._id,
                    name: item.product.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.product.images && item.product.images.length > 0
                        ? item.product.images[0].url
                        : 'https://via.placeholder.com/150',
                    stock: item.product.stock
                }));
                
                setCartItems(formattedItems);
            }
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng:', error);
            showToast({
                title: 'Lỗi',
                message: 'Không thể lấy thông tin giỏ hàng',
                type: 'error',
                duration: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi số lượng sản phẩm
    async function handleQuantityChange(id, newQuantity) {
        // Tìm sản phẩm trong giỏ hàng
        const item = cartItems.find(item => item.id === id);
        
        // Kiểm tra số lượng hợp lệ
        if (newQuantity < 1) return;
        if (item && newQuantity > item.stock) {
            showToast({
                title: "Cảnh báo",
                message: "Số lượng vượt quá tồn kho!",
                type: "warning",
                duration: 2000
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            // Gọi API cập nhật giỏ hàng
            const response = await axios.put(
                `${API_URL}/cart/update`,
                { 
                    itemId: id, 
                    quantity: newQuantity 
                },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                // Cập nhật state
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.id === id ? {...item, quantity: newQuantity} : item
            )
        );
                
        showToast({
            title: "Cập nhật",
            message: "Số lượng sản phẩm đã được cập nhật!",
            type: "info",
            duration: 2000
        });
                
                // Kích hoạt sự kiện cập nhật số lượng giỏ hàng
                window.dispatchEvent(new Event('cart-updated'));
            } else {
                showToast({
                    title: "Lỗi",
                    message: response.data.message || "Không thể cập nhật số lượng",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật giỏ hàng:', error);
            showToast({
                title: "Lỗi",
                message: "Đã xảy ra lỗi khi cập nhật giỏ hàng",
                type: "error",
                duration: 3000
            });
        }
    }

    // Xử lý xóa sản phẩm khỏi giỏ hàng
    async function handleRemoveItem(id) {
        try {
            const token = localStorage.getItem('token');
            // Gọi API xóa sản phẩm khỏi giỏ hàng
            const response = await axios.delete(
                `${API_URL}/cart/remove/${id}`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                // Cập nhật state
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
                
        showToast({
            title: "Đã xóa",
            message: "Sản phẩm đã được xóa khỏi giỏ hàng!",
            type: "success",
            duration: 3000
        });
                
                // Kích hoạt sự kiện cập nhật số lượng giỏ hàng
                window.dispatchEvent(new Event('cart-updated'));
            } else {
                showToast({
                    title: "Lỗi",
                    message: response.data.message || "Không thể xóa sản phẩm",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            showToast({
                title: "Lỗi",
                message: "Đã xảy ra lỗi khi xóa sản phẩm",
                type: "error",
                duration: 3000
            });
        }
    }

    // Tính tổng tiền
    function calculateTotal() {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Chuyển đến trang thanh toán
    function handleCheckout() {
        navigate('/checkout');
    }

    // Hiển thị giỏ hàng trống
    function renderEmptyCart() {
        return (
            <div className={cx('emptyCart')}>
                <div className={cx('row')}>
                    <div className={cx('col8')}>
                        <div className={cx('emptyCartContent')}>
                            <div className={cx('emptyCartIcon')}>
                                <img src={emptyCartImage} alt="Giỏ hàng trống" />
                            </div>
                            <h2>GIỎ HÀNG</h2>
                            <div className={cx('emptyCartText')}>
                                <p>Chúng tôi cam kết mang lại những giá trị cao nhất, chế độ bảo mật tốt nhất khi quý khách hàng tin dùng & mua sắm đồng hồ nam nữ chính hãng của thương hiệu <strong>Team2hand</strong></p>
                            </div>
                        </div>
                    </div>
                    <div className={cx('col4')}>
                        <div className={cx('cartSummaryEmpty')}>
                            <div className={cx('summaryItem')}>
                                <span>Tổng tiền</span>
                                <span>0 VND</span>
                            </div>
                            <div className={cx('summaryItem')}>
                                <span>Phụ thu</span>
                                <span>0 VND</span>
                            </div>
                            <div className={cx('summaryItem')}>
                                <span>Phí Vận Chuyển</span>
                                <span>0 VND</span>
                            </div>
                            <div className={cx('summaryItem', 'total')}>
                                <span>Thanh Toán</span>
                                <span>0 VND</span>
                            </div>
                            <button disabled className={cx('checkoutBtn')}>THANH TOÁN</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị từng sản phẩm trong giỏ hàng
    function renderCartItem(item) {
        return (
            <div key={item.id} className={cx('cartItem')}>
                <div className={cx('itemImage')}>
                    <img src={item.image} alt={item.name} />
                </div>
                <div className={cx('itemDetails')}>
                    <h3>{item.name}</h3>
                    <div className={cx('price')}>
                        {item.price.toLocaleString('vi-VN')} VND
                    </div>
                    <div className={cx('quantity')}>
                        <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                        >
                            +
                        </button>
                    </div>
                </div>
                <div className={cx('itemActions')}>
                    <button 
                        className={cx('removeBtn')}
                        onClick={() => handleRemoveItem(item.id)}
                    >
                        Xóa
                    </button>
                </div>
            </div>
        );
    }

    // Hiển thị giỏ hàng có sản phẩm
    function renderCart() {
        return (
            <div className={cx('container')}>
                <div className={cx('row')}>
                    <div className={cx('col8')}>
                        <div className={cx('cartItems')}>
                            <h2>Giỏ hàng của bạn</h2>
                            <div className={cx('itemsList')}>
                                {cartItems.map(item => renderCartItem(item))}
                            </div>
                        </div>
                    </div>
                    <div className={cx('col4')}>
                        <div className={cx('cartSummary')}>
                            <h3>Tổng đơn hàng</h3>
                            <div className={cx('summaryItem')}>
                                <span>Tạm tính:</span>
                                <span>{calculateTotal().toLocaleString('vi-VN')} VND</span>
                            </div>
                            <div className={cx('summaryItem')}>
                                <span>Phí vận chuyển:</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className={cx('summaryItem', 'total')}>
                                <span>Tổng cộng:</span>
                                <span>{calculateTotal().toLocaleString('vi-VN')} VND</span>
                            </div>
                            <button 
                                className={cx('checkoutBtn')}
                                onClick={handleCheckout}
                            >
                                THANH TOÁN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị thông báo đăng nhập nếu chưa đăng nhập
    function renderLoginRequired() {
        return (
            <div className={cx('loginRequired')}>
                <div className={cx('loginMessage')}>
                    <h2>Vui lòng đăng nhập để xem giỏ hàng</h2>
                    <p>Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình</p>
                    <button 
                        className={cx('loginBtn')}
                        onClick={() => navigate('/login')}
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    // Hiển thị trạng thái đang tải
    if (loading) {
        return <div className={cx('loading')}>Đang tải...</div>;
    }

    // Chưa đăng nhập
    if (!isAuthenticated) {
        return renderLoginRequired();
    }

    // Giỏ hàng trống hoặc có sản phẩm
    return (
        <div className={cx('cartPage')}>
            {cartItems.length === 0 ? renderEmptyCart() : renderCart()}
        </div>
    );
}

export default Cart; 