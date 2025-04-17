import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Header.module.scss'; // nếu dùng SCSS Module

const Header = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Load user khi component mount
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    setUser(loggedInUser);

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">🏪 MyShop</Link>
      </div>

      <nav className={styles.nav}>
        <Link to="/products">Sản phẩm</Link>
        <Link to="/brands">Thương hiệu</Link>
      </nav>

      <div className={styles.userActions}>
        {user ? (
          <div className={styles.account}>
            <span>Xin chào, <strong>{user.email}</strong></span>
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>
        ) : (
          <div className={styles.authLinks}>
            <Link to="/login">Đăng nhập</Link> | <Link to="/register">Đăng ký</Link>
          </div>
        )}

        <Link to="/cart" className={styles.cart}>
          🛒 <span>{cartCount}</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
