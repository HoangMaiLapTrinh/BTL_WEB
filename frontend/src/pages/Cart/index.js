import React, { useState } from 'react';
import * as styles from './Cart.module.scss';
import classNames from 'classnames/bind';
import '@fortawesome/fontawesome-free/css/all.min.css';
import emptyCartImage from '../../img/empty-cart.webp';
import { showToast } from '../../components/Toast/index.js';
const cx = classNames.bind(styles);

function Cart() {
    const [cartItems, setCartItems] = useState([]);

    function handleQuantityChange(id, newQuantity) {
        if (newQuantity < 1) return;
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
    }

    function handleRemoveItem(id) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        showToast({
            title: "Đã xóa",
            message: "Sản phẩm đã được xóa khỏi giỏ hàng!",
            type: "success",
            duration: 3000
        });
    }

    function calculateTotal() {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

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
                            <button className={cx('checkoutBtn')} disabled>
                                THANH TOÁN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                onClick={() => {
                                    console.log('Tiến hành thanh toán');
                                    showToast({
                                        title: "Thanh toán",
                                        message: "Đang chuyển đến trang thanh toán...",
                                        type: "info",
                                        duration: 2000
                                    });
                                }}
                            >
                                THANH TOÁN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('cartPage')}>
            {cartItems.length === 0 ? renderEmptyCart() : renderCart()}
        </div>
    );
}

export default Cart; 