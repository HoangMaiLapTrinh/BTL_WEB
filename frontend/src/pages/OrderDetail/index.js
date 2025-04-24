import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as styles from './OrderDetail.module.scss';
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

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${API_URL}/order/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          showToast({
            title: 'Lỗi',
            message: 'Không thể tải thông tin đơn hàng',
            type: 'error',
            duration: 3000
          });
          navigate('/my-orders');
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        showToast({
          title: 'Lỗi',
          message: 'Không thể tải thông tin đơn hàng',
          type: 'error',
          duration: 3000
        });
        navigate('/my-orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, navigate, user]);
  
  // Format date to Vietnamese locale
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  if (loading) {
    return (
      <div className={cx('orderDetailPage')}>
        <div className={cx('container')}>
          <div className={cx('loadingSection')}>
            <div className={cx('spinner')}></div>
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className={cx('orderDetailPage')}>
        <div className={cx('container')}>
          <div className={cx('errorSection')}>
            <div className={cx('errorIcon')}>
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2>Không tìm thấy đơn hàng</h2>
            <p>Đơn hàng không tồn tại hoặc bạn không có quyền truy cập</p>
            <Link to="/my-orders" className={cx('backButton')}>
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cx('orderDetailPage')}>
      <div className={cx('container')}>
        <div className={cx('pageHeader')}>
          <div className={cx('titleSection')}>
            <h1>Chi tiết đơn hàng</h1>
            <p>Mã đơn hàng: <span>{order._id}</span></p>
          </div>
          <div className={cx('orderStatus')}>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>
        
        <div className={cx('orderContent')}>
          <div className={cx('orderInfo')}>
            <div className={cx('infoCard')}>
              <h3>Thông tin giao hàng</h3>
              <div className={cx('infoDetails')}>
                <p><strong>Người nhận:</strong> {order.shippingInfo.fullName}</p>
                <p><strong>Địa chỉ:</strong> {order.shippingInfo.address}, {order.shippingInfo.city}</p>
                <p><strong>Số điện thoại:</strong> {order.shippingInfo.phoneNo}</p>
                {order.shippingInfo.postalCode && (
                  <p><strong>Mã bưu điện:</strong> {order.shippingInfo.postalCode}</p>
                )}
                <p><strong>Quốc gia:</strong> {order.shippingInfo.country}</p>
              </div>
            </div>
            
            <div className={cx('infoCard')}>
              <h3>Thông tin thanh toán</h3>
              <div className={cx('infoDetails')}>
                <p><strong>Phương thức:</strong> {order.paymentInfo.method}</p>
                <p><strong>Trạng thái:</strong> {order.paymentInfo.status}</p>
                {order.paidAt && <p><strong>Thanh toán lúc:</strong> {formatDate(order.paidAt)}</p>}
              </div>
            </div>
            
            <div className={cx('infoCard')}>
              <h3>Thông tin đơn hàng</h3>
              <div className={cx('infoDetails')}>
                <p><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Trạng thái:</strong> {order.orderStatus}</p>
                {order.deliveredAt && <p><strong>Giao hàng lúc:</strong> {formatDate(order.deliveredAt)}</p>}
                {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
              </div>
            </div>
          </div>
          
          <div className={cx('orderItems')}>
            <h3>Sản phẩm đã đặt</h3>
            <div className={cx('itemsList')}>
              {order.orderItems.map((item, index) => (
                <div key={index} className={cx('item')}>
                  <div className={cx('itemImage')}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className={cx('itemDetails')}>
                    <h4>{item.name}</h4>
                    <div className={cx('itemMeta')}>
                      <span className={cx('itemPrice')}>{item.price.toLocaleString('vi-VN')} VND</span>
                      <span className={cx('itemQuantity')}>x {item.quantity}</span>
                    </div>
                  </div>
                  <div className={cx('itemTotal')}>
                    {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={cx('orderSummary')}>
            <h3>Tổng kết đơn hàng</h3>
            <div className={cx('summaryTable')}>
              <div className={cx('summaryRow')}>
                <span>Tạm tính:</span>
                <span>{order.itemsPrice.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className={cx('summaryRow')}>
                <span>Thuế (10%):</span>
                <span>{order.taxPrice.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className={cx('summaryRow')}>
                <span>Phí vận chuyển:</span>
                <span>{order.shippingPrice === 0 ? 'Miễn phí' : order.shippingPrice.toLocaleString('vi-VN') + ' VND'}</span>
              </div>
              <div className={cx('summaryRow', 'total')}>
                <span>Tổng cộng:</span>
                <span>{order.totalPrice.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cx('actionButtons')}>
          <Link to="/my-orders" className={cx('backButton')}>
            <i className="fas fa-arrow-left"></i> Quay lại danh sách đơn hàng
          </Link>
          
          {order.orderStatus === 'Processing' && (
            <button className={cx('cancelButton')}>
              <i className="fas fa-times"></i> Hủy đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 