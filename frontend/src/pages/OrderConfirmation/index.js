import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as styles from './OrderConfirmation.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin đơn hàng từ state hoặc redirect về trang chủ nếu không có
  const { orderDetails, success } = location.state || {};
  
  if (!success || !orderDetails) {
    // Nếu không có thông tin đơn hàng, chuyển hướng về trang chủ
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    
    return null;
  }
  
  // Tính tổng tiền các sản phẩm
  const subtotal = orderDetails.itemsPrice;
  const taxPrice = orderDetails.taxPrice;
  const shippingPrice = orderDetails.shippingPrice || 0;
  const totalPrice = orderDetails.totalPrice;
  
  return (
    <div className={cx('orderConfirmationPage')}>
      <div className={cx('container')}>
        <div className={cx('confirmationBox')}>
          <div className={cx('header')}>
            <div className={cx('checkIcon')}>
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>Đặt hàng thành công!</h1>
            <p>Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.</p>
            <div className={cx('orderNumber')}>
              Mã đơn hàng: <span>{orderDetails._id}</span>
            </div>
          </div>
          
          <div className={cx('orderDetails')}>
            <div className={cx('section')}>
              <h3>Thông tin đơn hàng</h3>
              <div className={cx('orderInfo')}>
                <div className={cx('infoItem')}>
                  <span className={cx('label')}>Ngày đặt hàng:</span>
                  <span className={cx('value')}>{new Date(orderDetails.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className={cx('infoItem')}>
                  <span className={cx('label')}>Phương thức thanh toán:</span>
                  <span className={cx('value')}>{orderDetails.paymentInfo.method}</span>
                </div>
                <div className={cx('infoItem')}>
                  <span className={cx('label')}>Trạng thái thanh toán:</span>
                  <span className={cx('value')}>{orderDetails.paymentInfo.status}</span>
                </div>
              </div>
            </div>
            
            <div className={cx('section')}>
              <h3>Thông tin giao hàng</h3>
              <div className={cx('shippingInfo')}>
                <p><strong>Người nhận:</strong> {orderDetails.shippingInfo.fullName}</p>
                <p><strong>Địa chỉ:</strong> {orderDetails.shippingInfo.address}, {orderDetails.shippingInfo.city}</p>
                <p><strong>Số điện thoại:</strong> {orderDetails.shippingInfo.phoneNo}</p>
              </div>
            </div>
            
            <div className={cx('section')}>
              <h3>Sản phẩm đã đặt</h3>
              <div className={cx('productsTable')}>
                {orderDetails.orderItems.map((item, index) => (
                  <div key={index} className={cx('productItem')}>
                    <div className={cx('productImage')}>
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className={cx('productDetails')}>
                      <h4>{item.name}</h4>
                      <div className={cx('quantity')}>Số lượng: {item.quantity}</div>
                      <div className={cx('price')}>{item.price.toLocaleString('vi-VN')} VND</div>
                    </div>
                    <div className={cx('productTotal')}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={cx('orderSummary')}>
              <div className={cx('summaryItem')}>
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className={cx('summaryItem')}>
                <span>Thuế:</span>
                <span>{taxPrice.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className={cx('summaryItem')}>
                <span>Phí vận chuyển:</span>
                <span>{shippingPrice === 0 ? 'Miễn phí' : shippingPrice.toLocaleString('vi-VN') + ' VND'}</span>
              </div>
              <div className={cx('summaryItem', 'total')}>
                <span>Tổng cộng:</span>
                <span>{totalPrice.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>
          
          <div className={cx('actions')}>
            <button 
              className={cx('continueShoppingBtn')}
              onClick={() => navigate('/')}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 