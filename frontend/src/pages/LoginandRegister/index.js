import React, { useState, useEffect } from 'react';
import useLoginAndRegisterLogic from './LoginandRegister.js';
import * as styles from './LoginandRegister.module.scss';
import classNames from 'classnames/bind';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { register, login } from '../../services/authService.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { showToast } from '../../components/Toast/index.js';

const cx = classNames.bind(styles);

function LoginAndRegister() {
  const { isSignUpActive, toggleToSignUp, toggleToSignIn } = useLoginAndRegisterLogic();
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Kiểm tra URL để xác định form nào cần hiển thị
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get('action');
    if (action === 'register') {
      toggleToSignUp();
    } else {
      toggleToSignIn();
    }
  }, [location]);

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
        // Reset form data
        setFormData({
          name: '',
          email: '',
          password: ''
        });
        // Chuyển sang form đăng nhập sau 2 giây
        setTimeout(() => {
          toggleToSignIn();
        }, 2000);
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
        showToast({
          title: "Thành công!",
          message: "Đăng nhập thành công!",
          type: "success",
          duration: 3000
        });
        authLogin(response.user);
        navigate('/');
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
              <button className={styles.hidden} onClick={toggleToSignIn}>
                Sign In
              </button>
            </div>
            <div className={cx('toggle-panel', 'toggle-right')}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className={styles.hidden} onClick={toggleToSignUp}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAndRegister;
