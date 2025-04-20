import classNames from 'classnames/bind';
import * as styles from './Header.module.scss';
import React from 'react';
import { Link } from 'react-router-dom';
import logo_rmbg from '../../../../img/logo-rmbg.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useHeaderLogic } from './header.js';

const cx = classNames.bind(styles);

function Header() {
    const {
        user,
        cartCount,
        isBrandDropdownOpen,
        toggleBrandDropdown,
        handleLogout
    } = useHeaderLogic();
    
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
                                    <Link className={cx('dropdown-item')} to="/product?brand=Gucci">Gucci</Link>
                                    <Link className={cx('dropdown-item')} to="/product?brand=Louis Vuitton">Louis Vuitton</Link>
                                    <Link className={cx('dropdown-item')} to="/product?brand=Prada">Prada</Link>
                                    <Link className={cx('dropdown-item')} to="/product?brand=Dior">Dior</Link>
                                    <Link className={cx('dropdown-item')} to="/product?brand=Balenciaga">Balenciaga</Link>
                                    <Link className={cx('dropdown-item')} to="/product?brand=Nike">Nike</Link>
                                    <Link className={cx('dropdown-item')} to="/product?brand=Adidas">Adidas</Link>
                                </div>
                        </li>
                        <li className={cx('nav-item')}>
                            <Link to="/men" className={cx('nav-link')}>ĐỒ NAM</Link>
                        </li>
                        <li className={cx('nav-item')}>
                            <Link to="/women" className={cx('nav-link')}>ĐỒ NỮ</Link>
                        </li>
                    </ul>
                </div>

                <div className={cx('logo')}>
                    <Link to="/"><img src={logo_rmbg} alt="Logo" className={cx('logo_rmbg')} /></Link>
                </div>

                <div className={cx('nav-right')}>
                    <ul className={cx('main-menu')}>
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
                                    <Link to="/login" className={cx('btn-dtl')}>
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

                        <li className={cx('nav-item')}>
                            <Link to="/cart" className={cx('nav-link')}>
                                <i className="fa-solid fa-cart-shopping"></i>
                                <span className={cx('cart-count')}>{cartCount}</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default Header;
