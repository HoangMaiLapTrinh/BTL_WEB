import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import React from 'react';
import logo_rmbg from 'D:/Program Files/GitHub/BTL_WEB/frontend/src/img/logo-rmbg.png';
const cx = classNames.bind(styles);
console.log(styles);

function Header() {
    return <header className={cx('wrapper')}>
        <div className={cx('logo')}>
            <img src={logo_rmbg} alt="Logo" className={cx('logo_rmbg')} />
        </div>
        <div className={cx('inner')}>

        </div>
    </header>
}

export default Header;
