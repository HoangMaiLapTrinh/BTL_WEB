import classNames from 'classnames/bind';
import * as styles from './Header.module.scss';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo_rmbg from '../../../../img/logo-rmbg.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../../../context/AuthContext.js';
import BadgeCart from '../../../BadgeCart/index.js';

const cx = classNames.bind(styles);

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // State cho thanh tìm kiếm
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleLogout = () => {
        logout();
    };
    
    // Hàm xử lý khi người dùng nhấp vào một thương hiệu
    const navigateToBrand = (brand) => {
        navigate(`/products?brand=${encodeURIComponent(brand)}`);
    };
    
    // Hàm xử lý khi người dùng nhấp vào đồ nam hoặc đồ nữ
    const navigateToGender = (gender) => {
        navigate(`/products?gender=${encodeURIComponent(gender)}`);
    };
    
    // Hàm xử lý khi bấm vào icon search
    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (showSearch) {
            setSearchTerm('');
        }
    };
    
    // Hàm xử lý khi submit form tìm kiếm
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setShowSearch(false);
        }
    };
    
    // Hàm xử lý khi nhấn phím Enter trong input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
        }
    };
    
    // Hàm xử lý khi click ra ngoài thanh tìm kiếm
    useEffect(() => {
        const handleClickOutside = (event) => {
            const searchBox = document.getElementById('search-box');
            const searchIcon = document.getElementById('search-icon');
            
            if (showSearch && searchBox && !searchBox.contains(event.target) && !searchIcon.contains(event.target)) {
                setShowSearch(false);
                setSearchTerm('');
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearch]);
    
    return (
        <header className={cx('wrapper')}>
            <div className={cx('nav')}>
                <div className={cx('nav-left')}>
                    <ul className={cx('main-menu')}>
                        <li className={cx('nav-item')}>
                            <Link to="/products" className={cx('nav-link')}>SẢN PHẨM</Link>
                        </li>
                        <li className={cx('nav-item', 'dropdown')}>
                            <span className={cx('nav-link', 'dropdown-toggle')}>THƯƠNG HIỆU</span>
                            <div className={cx('dropdown-menu')}>
                                <a className={cx('dropdown-item')} onClick={() => navigateToBrand('Gucci')}>Gucci</a>
                                <a className={cx('dropdown-item')} onClick={() => navigateToBrand('Louis Vuitton')}>Louis Vuitton</a>
                                <a className={cx('dropdown-item')} onClick={() => navigateToBrand('Prada')}>Prada</a>
                                <a className={cx('dropdown-item')} onClick={() => navigateToBrand('Dior')}>Dior</a>
                                <a className={cx('dropdown-item')} onClick={() => navigateToBrand('Balenciaga')}>Balenciaga</a>
                                <a className={cx('dropdown-item')} onClick={() => navigateToBrand('Nike')}>Nike</a>
                                <a className={cx('dropdown-item')} onClick={() => navigateToBrand('Adidas')}>Adidas</a>
                            </div>
                        </li>
                        <li className={cx('nav-item')}>
                            <a onClick={() => navigateToGender('Nam')} className={cx('nav-link')}>ĐỒ NAM</a>
                        </li>
                        <li className={cx('nav-item')}>
                            <a onClick={() => navigateToGender('Nữ')} className={cx('nav-link')}>ĐỒ NỮ</a>
                        </li>
                    </ul>
                </div>

                <div className={cx('logo')}>
                    <Link to="/"><img src={logo_rmbg} alt="Logo" className={cx('logo_rmbg')} /></Link>
                </div>

                <div className={cx('nav-right')}>
                    <ul className={cx('main-menu')}>
                        {/* Icon tìm kiếm */}
                        <li className={cx('nav-item')}>
                            <div className={cx('search-container')}>
                                <span className={cx('nav-link')}>
                                    <i 
                                        id="search-icon"
                                        className="fas fa-search" 
                                        onClick={toggleSearch}
                                    ></i>
                                </span>
                                {showSearch && (
                                    <div id="search-box" className={cx('search-box')}>
                                        <form onSubmit={handleSearchSubmit}>
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm sản phẩm..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                autoFocus
                                            />
                                            <button type="submit">
                                                <i className="fas fa-search"></i>
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </li>
                        
                        <li className={cx('nav-item')}>
                            <Link to="/info" className={cx('nav-link')}>LIÊN HỆ</Link>
                        </li>

                        {!user ? (
                            <li className={cx('nav-item')}>
                                <div className={cx('auth-buttons')}>
                                    <Link to="/login" className={cx('btn-dtl')}>
                                        <i className="fas fa-sign-in-alt" style={{ marginRight: '5px' }}></i>
                                        <span className={cx('btn-text')}>ĐĂNG NHẬP</span>
                                    </Link>
                                    <Link to="/login?action=register" className={cx('btn-dtl')}>
                                        <i className="fas fa-user-plus" style={{ marginRight: '5px' }}></i>
                                        <span>ĐĂNG KÝ</span>
                                    </Link>
                                </div>
                            </li>
                        ) : (
                            <li className={cx('nav-item', 'dropdown')}>
                                <span className={cx('nav-link', 'dropdown-toggle')}>
                                    <i className="fas fa-user-circle" style={{ marginRight: '5px' }}></i>
                                    {user.email}
                                </span>
                                <div className={cx('dropdown-menu')}>
                                    <Link className={cx('dropdown-item')} to="/profile">
                                        <i className="fas fa-id-card-alt" style={{ marginRight: '5px' }}></i>
                                        Thông tin tài khoản
                                    </Link>
                                    <Link className={cx('dropdown-item')} to="/my-orders">
                                        <i className="fas fa-shopping-bag" style={{ marginRight: '5px' }}></i>
                                        Các đơn của tôi
                                    </Link>
                                    <Link className={cx('dropdown-item')} to="/change-password">
                                        <i className="fas fa-key" style={{ marginRight: '5px' }}></i>
                                        Đổi mật khẩu
                                    </Link>
                                    <Link className={cx('dropdown-item')} to="/settings">
                                        <i className="fas fa-cog" style={{ marginRight: '5px' }}></i>
                                        Thiết lập
                                    </Link>
                                    <button className={cx('dropdown-item')} onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt" style={{ marginRight: '5px' }}></i>
                                        Đăng xuất
                                    </button>
                                </div>
                            </li>
                        )}

                        <li className={cx('nav-item', 'cart-container')}>
                            <BadgeCart />
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default Header;
