import React, { useState, useEffect } from 'react';
import useLoginAndRegisterLogic from './LoginandRegister.js';
import * as styles from './LoginandRegister.module.scss';
import classNames from 'classnames/bind';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { register, login } from '../../services/authService.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { showToast } from '../../components/Toast/index.js';
import bcrypt from 'bcryptjs';

const cx = classNames.bind(styles);

function LoginAndRegister() {
  const { isSignUpActive, toggleToSignUp, toggleToSignIn } = useLoginAndRegisterLogic();
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [adminRequired, setAdminRequired] = useState(false);

  // Kiểm tra URL để xác định form nào cần hiển thị và nếu yêu cầu quyền admin
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get('action');
    const adminReq = searchParams.get('adminRequired');
    
    if (action === 'register') {
      toggleToSignUp();
    } else {
      toggleToSignIn();
    }

    if (adminReq === 'true') {
      setAdminRequired(true);
      if (user && user.role !== 'admin') {
        setError('Bạn cần đăng nhập bằng tài khoản có quyền admin để truy cập trang này');
        showToast({
          title: "Yêu cầu quyền Admin",
          message: "Bạn cần đăng nhập bằng tài khoản có quyền admin để truy cập trang này",
          type: "warning",
          duration: 5000
        });
      }
    } else {
      setAdminRequired(false);
    }
  }, [location, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      if (response.success) {
        showToast({
          title: "Thành công!",
          message: "Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
          type: "success",
          duration: 3000
        });
        setError('');
        // Đăng nhập ngay sau khi đăng ký
        authLogin(response.user, response.token);
        
        // Chuyển hướng người dùng
        if (response.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError(error.message || 'Đăng ký thất bại');
      showToast({
        title: "Lỗi!",
        message: error.message || 'Đăng ký thất bại',
        type: "error",
        duration: 3000
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      if (response.success) {
        // Kiểm tra xem đã yêu cầu quyền admin chưa và người dùng đăng nhập có phải admin không
        if (adminRequired && response.user.role !== 'admin') {
          setError('Tài khoản của bạn không có quyền admin. Vui lòng đăng nhập với tài khoản admin.');
          showToast({
            title: "Không có quyền",
            message: "Tài khoản của bạn không có quyền admin. Vui lòng đăng nhập với tài khoản admin.",
            type: "error",
            duration: 4000
          });
          return;
        }

        showToast({
          title: "Thành công!",
          message: "Đăng nhập thành công!",
          type: "success",
          duration: 3000
        });
        authLogin(response.user, response.token);

        // Nếu có từ trang khác chuyển đến, quay lại trang đó
        const fromPage = location.state?.from?.pathname || '/';
        if (response.user.role === 'admin') {
          navigate(fromPage === '/admin' ? '/admin' : '/admin');
        } else {
          navigate(fromPage === '/admin' ? '/' : fromPage);
        }
      }
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại');
      showToast({
        title: "Lỗi!",
        message: error.message || 'Đăng nhập thất bại',
        type: "error",
        duration: 3000
      });
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container', { active: isSignUpActive })} id="container">
        {/* Sign Up Form */}
        <div className={cx('form-container', 'sign-up', { hidden: !isSignUpActive })}>
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <div className={styles['social-icons']}>
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registration</span>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {adminRequired && (
              <div style={{ color: 'orange', marginBottom: '10px', fontWeight: 'bold', fontSize: '12px' }}>
                Cần tài khoản admin để truy cập trang Admin
              </div>
            )}
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              value={formData.name}
              onChange={handleChange}
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
            />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={cx('form-container', 'sign-in', { hidden: isSignUpActive })}>
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <div className={styles['social-icons']}>
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email password</span>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {adminRequired && (
              <div style={{ color: 'orange', marginBottom: '10px', fontWeight: 'bold', fontSize: '12px' }}>
                Cần tài khoản admin để truy cập trang Admin
              </div>
            )}
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
            />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
            />
            <a href="#">Forget Your Password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Toggle Panel */}
        <div className={styles['toggle-container']}>
          <div className={styles.toggle}>
            <div className={cx('toggle-panel', 'toggle-left')}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className={styles.hidden} onClick={toggleToSignIn}>Sign In</button>
            </div>
            <div className={cx('toggle-panel', 'toggle-right')}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className={styles.hidden} onClick={toggleToSignUp}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAndRegister;
