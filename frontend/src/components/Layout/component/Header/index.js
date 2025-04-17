import classNames from 'classnames/bind';
import * as styles from './Header.module.scss';
import React from 'react';
import logo_rmbg from '../../../../img/logo-rmbg.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Header() {
    return (
        <header className={cx('wrapper')}>
            <div className={cx('nav')}>
                <div className={cx('nav-left')}>
                    <ul className={cx('main-menu')}>
                        <li className={cx('nav-item')}>
                            <Link to="/products" className={cx('nav-link')}>SẢN PHẨM</Link>
                        </li>
                        
                        <li className={cx('nav-item', 'dropdown')}>
                            <span className={cx('nav-link', 'dropdown-toggle')}>
                                THƯƠNG HIỆU
                            </span>
                            <div className={cx('dropdown-menu')}>
                                <Link className={cx('dropdown-item')} to="/product?brand=casio">Casio</Link>
                                <Link className={cx('dropdown-item')} to="/product?brand=pierre-nannier">Pierre nannier</Link>
                                <Link className={cx('dropdown-item')} to="/product?brand=tudor">Tudor</Link>
                                <Link className={cx('dropdown-item')} to="/product?brand=tissot">Tissot</Link>
                                <Link className={cx('dropdown-item')} to="/product?brand=g-shock">G-shock</Link>
                                <Link className={cx('dropdown-item')} to="/product?brand=orient">Orient</Link>
                                <Link className={cx('dropdown-item')} to="/product?brand=citizen">Citizen</Link>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className={cx('logo')}>
                    <Link to="/"><img src={logo_rmbg} alt="Logo" className={cx('logo_rmbg')} /></Link>
                </div>

                <div className={cx('nav-right')}>
                    <ul className={cx('main-menu')}>
                        <li className={cx('nav-item')}>
                            <Link to="/cart" className={cx('nav-link')}>GIỎ HÀNG</Link>
                        </li>
                    </ul>
                        
                </div>
            </div>
        </header>
    );
}

export default Header;
