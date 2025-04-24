import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as styles from './MyOrders.module.scss';
import classNames from 'classnames/bind';
import axios from 'axios';
import { API_URL } from '../../services/authService.js';
import { showToast } from '../../components/Toast/index.js';
import { useAuth } from '../../context/AuthContext.js';

const cx = classNames.bind(styles);

const OrderStatusBadge = ({ status }) => {
  let badgeClass = '';
  
  switch(status) {
    case 'Processing':
      badgeClass = 'statusProcessing';
      break;
    case 'Confirmed':
      badgeClass = 'statusConfirmed';
      break;
    case 'Shipping':
      badgeClass = 'statusShipping';
      break;
    case 'Delivered':
      badgeClass = 'statusDelivered';
      break;
    case 'Cancelled':
      badgeClass = 'statusCancelled';
      break;
    default:
      badgeClass = 'statusDefault';
  }
  
  return <span className={cx('statusBadge', badgeClass)}>{status}</span>;
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${API_URL}/orders/orders/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        if (response.data.success) {
          // Sort orders by date (newest first)
          const sortedOrders = response.data.orders.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sortedOrders);
        } else {
          showToast({
            title: 'Lỗi',
            message: 'Không thể tải danh sách đơn hàng',
            type: 'error',
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đơn hàng:', error);
        showToast({
          title: 'Lỗi',
          message: 'Không thể tải danh sách đơn hàng',
          type: 'error',
          duration: 3000
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [navigate, user]);
  
  // Format date to Vietnamese locale
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  return (
    <div className={cx('myOrdersPage')}>
      <div className={cx('container')}>
        <div className={cx('pageHeader')}>
          <h1>Đơn hàng của tôi</h1>
          <p>Quản lý và theo dõi tất cả đơn hàng của bạn</p>
        </div>
        
        {loading ? (
          <div className={cx('loadingSection')}>
            <div className={cx('spinner')}></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={cx('emptyOrders')}>
            <div className={cx('emptyIcon')}>
              <i className="fas fa-shopping-basket"></i>
            </div>
            <h2>Bạn chưa có đơn hàng nào</h2>
            <p>Hãy mua sắm và quay lại đây để theo dõi đơn hàng của bạn</p>
            <Link to="/products" className={cx('shopNowBtn')}>
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className={cx('ordersContainer')}>
            {orders.map((order) => (
              <div key={order._id} className={cx('orderCard')}>
                <div className={cx('orderHeader')}>
                  <div className={cx('orderInfo')}>
                    <div className={cx('orderId')}>
                      <span className={cx('label')}>Mã đơn hàng:</span>
                      <span className={cx('value')}>{order._id}</span>
                    </div>
                    <div className={cx('orderDate')}>
                      <span className={cx('label')}>Ngày đặt:</span>
                      <span className={cx('value')}>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className={cx('orderStatus')}>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>
                
                <div className={cx('orderBody')}>
                  <div className={cx('orderItems')}>
                    {order.orderItems.slice(0, 2).map((item, index) => (
                      <div key={index} className={cx('orderItem')}>
                        <div className={cx('itemImage')}>
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className={cx('itemDetails')}>
                          <div className={cx('itemName')}>{item.name}</div>
                          <div className={cx('itemQuantity')}>x{item.quantity}</div>
                          <div className={cx('itemPrice')}>{item.price.toLocaleString('vi-VN')} VND</div>
                        </div>
                      </div>
                    ))}
                    
                    {order.orderItems.length > 2 && (
                      <div className={cx('moreItems')}>
                        +{order.orderItems.length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>
                  
                  <div className={cx('orderTotal')}>
                    <div className={cx('totalAmount')}>
                      <span className={cx('label')}>Tổng tiền:</span>
                      <span className={cx('value')}>{order.totalPrice.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className={cx('paymentMethod')}>
                      <span className={cx('label')}>Thanh toán:</span>
                      <span className={cx('value')}>{order.paymentInfo.method}</span>
                    </div>
                    <div className={cx('paymentStatus')}>
                      <span className={cx('label')}>Trạng thái:</span>
                      <span className={cx('value')}>{order.paymentInfo.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className={cx('orderFooter')}>
                  <Link to={`/order/${order._id}`} className={cx('viewDetailsBtn')}>
                    Xem chi tiết
                  </Link>
                  {order.orderStatus === 'Processing' && (
                    <button className={cx('cancelOrderBtn')}>
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders; 