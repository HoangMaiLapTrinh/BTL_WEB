import React, { useState } from 'react';
import * as styles from './Checkout.module.scss';
import classNames from 'classnames/bind';
import { showToast } from '../../components/Toast/index.js';
const cx = classNames.bind(styles);

const Checkout = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        phone: '',
        note: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý logic thanh toán ở đây
        console.log('Form data:', formData);
        
        // Kiểm tra điều kiện form
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.phone) {
            showToast({
                title: "Lỗi",
                message: "Vui lòng điền đầy đủ thông tin!",
                type: "error",
                duration: 3000
            });
            return;
        }
        
        // Thông báo thành công nếu form hợp lệ
        showToast({
            title: "Thành công",
            message: "Đơn hàng của bạn đã được đặt thành công!",
            type: "success",
            duration: 3000
        });
    };

    return (
        <div className={cx('checkoutPage')}>
            <div className={cx('container')}>
                <div className={cx('row')}>
                    <div className={cx('col8')}>
                        <div className={cx('checkoutBilling')}>
                            <h2>Billing Details</h2>
                            <form onSubmit={handleSubmit}>
                                <div className={cx('row')}>
                                    <div className={cx('col6')}>
                                        <div className={cx('formGroup')}>
                                            <label>First Name</label>
                                            <input 
                                                type="text" 
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={cx('col6')}>
                                        <div className={cx('formGroup')}>
                                            <label>Last Name</label>
                                            <input 
                                                type="text" 
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>Address</label>
                                    <input 
                                        type="text" 
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>Phone</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('formGroup')}>
                                    <label>Order notes</label>
                                    <textarea 
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        placeholder="Notes about your order, e.g. special notes for delivery"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className={cx('col4')}>
                        <div className={cx('checkoutOrder')}>
                            <h4>Your Order</h4>
                            <div className={cx('orderTotal')}>
                                <ul>
                                    <li>Subtotal <span>$79.65</span></li>
                                    <li>Shipping <span>Free</span></li>
                                    <li className={cx('totalAmount')}>Total <span>$79.65</span></li>
                                </ul>
                            </div>
                            <div className={cx('paymentMethod')}>
                                <div className={cx('orderBtn')}>
                                    <button 
                                        type="submit" 
                                        className={cx('siteBtn')}
                                        onClick={handleSubmit}
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 