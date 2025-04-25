import classNames from 'classnames/bind';
import * as styles from './Header.module.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo_rmbg from '../../../../img/logo-rmbg.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../../../context/AuthContext.js';
import BadgeCart from '../../../BadgeCart/index.js';
import { showToast } from '../../../Toast/index.js';

const cx = classNames.bind(styles);

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // State cho thanh tìm kiếm
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // State cho mobile menu
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    // State cho mobile dropdowns
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
    
    const mobileMenuRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const hamburgerIconRef = useRef(null);
    
    // Hàm toggle mobile menu - sử dụng useCallback để tránh tạo hàm mới mỗi lần render
    const toggleMobileMenu = useCallback(() => {
        setShowMobileMenu(prevState => {
            // Loại bỏ toast khi mở/đóng menu
            return !prevState;
        });
    }, []);  // Empty dependency array để hàm không bị tạo lại
    
    const handleLogout = useCallback(() => {
        logout();
        setShowMobileMenu(false);
        
        // Chỉ hiển thị toast khi đăng xuất trên mobile
        const isMobileDevice = window.innerWidth <= 768;
        if (isMobileDevice) {
            showToast({
                title: "Đăng xuất thành công",
                message: "Hẹn gặp lại bạn!",
                type: "success",
                duration: 2000
            });
        }
    }, [logout]);
    
    // Hàm xử lý khi người dùng nhấp vào một thương hiệu
    const navigateToBrand = useCallback((brand) => {
        navigate(`/products?brand=${encodeURIComponent(brand)}`);
        setShowMobileMenu(false);
    }, [navigate]);
    
    // Hàm xử lý khi người dùng nhấp vào đồ nam hoặc đồ nữ
    const navigateToGender = useCallback((gender) => {
        navigate(`/products?gender=${encodeURIComponent(gender)}`);
        setShowMobileMenu(false);
    }, [navigate]);
    
    // Hàm xử lý khi bấm vào icon search
    const toggleSearch = useCallback(() => {
        setShowSearch(prevState => !prevState);
        if (showSearch) {
            setSearchTerm('');
        }
    }, [showSearch]);
    
    // Hàm xử lý khi bấm vào icon search trên mobile
    const toggleMobileSearch = useCallback(() => {
        setShowMobileSearch(prevState => {
            // Chỉ hiển thị toast khi mở search box lần đầu
            const isMobileDevice = window.innerWidth <= 768;
            if (isMobileDevice && !prevState) {
                showToast({
                    title: "Tìm kiếm",
                    message: "Nhập từ khóa để tìm sản phẩm",
                    type: "info",
                    duration: 1500
                });
            }
            return !prevState;
        });
        if (showMobileSearch) {
            setSearchTerm('');
        }
    }, [showMobileSearch]);
    
    // Hàm xử lý khi submit form tìm kiếm
    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setShowSearch(false);
            setShowMobileSearch(false);
            
            // Chỉ hiển thị toast khi tìm kiếm với từ khóa có ý nghĩa (dài hơn 3 ký tự)
            const isMobileDevice = window.innerWidth <= 768;
            if (isMobileDevice && searchTerm.trim().length > 3) {
                showToast({
                    title: "Đang tìm kiếm",
                    message: `"${searchTerm.trim()}" - Đang hiển thị kết quả`,
                    type: "info",
                    duration: 1500
                });
            }
        }
    }, [navigate, searchTerm]);
    
    // Hàm xử lý khi nhấn phím Enter trong input
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
        }
    }, [handleSearchSubmit]);
    
    // Hàm để đóng mobile menu khi click vào link
    const closeMobileMenu = useCallback(() => {
        setShowMobileMenu(false);
        setActiveMobileDropdown(null);
        
        // Bỏ thông báo toast khi chọn mục trong menu
    }, []);

    // Hàm xử lý toggle mobile dropdown
    const toggleMobileDropdown = useCallback((dropdownName) => {
        setActiveMobileDropdown(prevDropdown => 
            prevDropdown === dropdownName ? null : dropdownName
        );
    }, []);
    
    // Ngăn scroll khi mobile menu đang mở
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }

        return () => {
            document.body.style.overflow = 'visible';
        };
    }, [showMobileMenu]);
    
    // Sử dụng useEffect riêng cho hamburger icon để đảm bảo sự nhất quán
    useEffect(() => {
        const handleHamburgerClick = (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        };
        
        const hamburgerElement = hamburgerIconRef.current;
        if (hamburgerElement) {
            hamburgerElement.addEventListener('click', handleHamburgerClick);
        }
        
        return () => {
            if (hamburgerElement) {
                hamburgerElement.removeEventListener('click', handleHamburgerClick);
            }
        };
    }, [toggleMobileMenu]);
    
    // Hàm xử lý khi click ra ngoài thanh tìm kiếm
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Không xử lý click trên hamburger icon
            if (hamburgerIconRef.current && hamburgerIconRef.current.contains(event.target)) {
                return;
            }
            
            const searchBox = document.getElementById('search-box');
            const searchIcon = document.getElementById('search-icon');
            
            if (showSearch && searchBox && !searchBox.contains(event.target) && !searchIcon.contains(event.target)) {
                setShowSearch(false);
                setSearchTerm('');
            }
            
            // Xử lý đóng mobile search
            if (mobileSearchRef.current && showMobileSearch && !mobileSearchRef.current.contains(event.target)) {
                setShowMobileSearch(false);
                setSearchTerm('');
            }
            
            // Xử lý đóng mobile menu khi click ra ngoài
            if (showMobileMenu && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearch, showMobileMenu, showMobileSearch]);
    
    // Xử lý khi người dùng nhấp vào đường dẫn đăng nhập trên mobile
    const handleMobileLogin = useCallback(() => {
        closeMobileMenu();
        // Loại bỏ thông báo toast khi nhấp đăng nhập
    }, [closeMobileMenu]);

    // Xử lý khi người dùng nhấp vào đường dẫn đăng ký trên mobile
    const handleMobileRegister = useCallback(() => {
        closeMobileMenu();
        // Loại bỏ thông báo toast khi nhấp đăng ký
    }, [closeMobileMenu]);
    
    return (
        <header className={cx('wrapper')}>
            <div className={cx('nav')}>
                {/* Menu desktop */}
                <div className={cx('nav-left', 'desktop-only')}>
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

                {/* Mobile controls - Left */}
                <div className={cx('mobile-nav-left', 'mobile-only')}>
                    <div className={cx('mobile-search-icon')} onClick={toggleMobileSearch}>
                        <i className="fas fa-search"></i>
                    </div>
                </div>

                {/* Logo (center for both desktop and mobile) */}
                <div className={cx('logo')}>
                    <Link to="/"><img src={logo_rmbg} alt="Logo" className={cx('logo_rmbg')} /></Link>
                </div>

                {/* Menu desktop */}
                <div className={cx('nav-right', 'desktop-only')}>
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

                {/* Mobile controls - Right */}
                <div className={cx('mobile-nav-right', 'mobile-only')}>
                    <div className={cx('mobile-cart')}>
                        <BadgeCart />
                    </div>
                    <button 
                        type="button"
                        className={cx('hamburger-icon')} 
                        ref={hamburgerIconRef}
                        aria-label={showMobileMenu ? "Đóng menu" : "Mở menu"}
                    >
                        <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Search Box */}
            {showMobileSearch && (
                <div className={cx('mobile-search-container')} ref={mobileSearchRef}>
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
                        <button type="button" className={cx('close-search')} onClick={toggleMobileSearch}>
                            <i className="fas fa-times"></i>
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Menu */}
            <div className={cx('mobile-menu', { show: showMobileMenu })} ref={mobileMenuRef}>
                <div className={cx('mobile-menu-header')}>
                    <button 
                        className={cx('close-menu-button')} 
                        onClick={closeMobileMenu}
                        aria-label="Đóng menu"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <h2>Menu</h2>
                </div>
                <ul className={cx('mobile-menu-list')}>
                    <li>
                        <Link to="/products" className={cx('mobile-menu-link')} onClick={closeMobileMenu}>SẢN PHẨM</Link>
                    </li>
                    <li className={cx('mobile-dropdown')}>
                        <div 
                            className={cx('mobile-dropdown-toggle', { active: activeMobileDropdown === 'brands' })}
                            onClick={() => toggleMobileDropdown('brands')}
                        >
                            <span>THƯƠNG HIỆU</span>
                            <i className={`fas fa-chevron-down ${activeMobileDropdown === 'brands' ? cx('rotate') : ''}`}></i>
                        </div>
                        <ul className={cx('mobile-dropdown-menu', { active: activeMobileDropdown === 'brands' })}>
                            <li><a onClick={() => navigateToBrand('Gucci')}>Gucci</a></li>
                            <li><a onClick={() => navigateToBrand('Louis Vuitton')}>Louis Vuitton</a></li>
                            <li><a onClick={() => navigateToBrand('Prada')}>Prada</a></li>
                            <li><a onClick={() => navigateToBrand('Dior')}>Dior</a></li>
                            <li><a onClick={() => navigateToBrand('Balenciaga')}>Balenciaga</a></li>
                            <li><a onClick={() => navigateToBrand('Nike')}>Nike</a></li>
                            <li><a onClick={() => navigateToBrand('Adidas')}>Adidas</a></li>
                        </ul>
                    </li>
                    <li>
                        <a onClick={() => navigateToGender('Nam')} className={cx('mobile-menu-link')}>ĐỒ NAM</a>
                    </li>
                    <li>
                        <a onClick={() => navigateToGender('Nữ')} className={cx('mobile-menu-link')}>ĐỒ NỮ</a>
                    </li>
                    <li>
                        <Link to="/info" className={cx('mobile-menu-link')} onClick={closeMobileMenu}>LIÊN HỆ</Link>
                    </li>
                    
                    {!user ? (
                        <>
                            <li>
                                <Link to="/login" className={cx('mobile-menu-link')} onClick={handleMobileLogin}>
                                    <i className="fas fa-sign-in-alt"></i> ĐĂNG NHẬP
                                </Link>
                            </li>
                            <li>
                                <Link to="/login?action=register" className={cx('mobile-menu-link')} onClick={handleMobileRegister}>
                                    <i className="fas fa-user-plus"></i> ĐĂNG KÝ
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className={cx('mobile-dropdown')}>
                                <div 
                                    className={cx('mobile-dropdown-toggle', { active: activeMobileDropdown === 'account' })}
                                    onClick={() => toggleMobileDropdown('account')}
                                >
                                    <span><i className="fas fa-user-circle"></i> TÀI KHOẢN</span>
                                    <i className={`fas fa-chevron-down ${activeMobileDropdown === 'account' ? cx('rotate') : ''}`}></i>
                                </div>
                                <ul className={cx('mobile-dropdown-menu', { active: activeMobileDropdown === 'account' })}>
                                    <li>
                                        <Link to="/profile" onClick={closeMobileMenu}>
                                            <i className="fas fa-id-card-alt"></i> Thông tin tài khoản
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-orders" onClick={closeMobileMenu}>
                                            <i className="fas fa-shopping-bag"></i> Các đơn của tôi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/change-password" onClick={closeMobileMenu}>
                                            <i className="fas fa-key"></i> Đổi mật khẩu
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/settings" onClick={closeMobileMenu}>
                                            <i className="fas fa-cog"></i> Thiết lập
                                        </Link>
                                    </li>
                                    <li>
                                        <a onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt"></i> Đăng xuất
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </header>
    );
}

export default Header;
