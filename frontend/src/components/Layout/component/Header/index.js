import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import React from 'react';

const cx = classNames.bind(styles);

function Header() {
    return <header className={cx('wrapper')}>
        <div className={cx('logo')}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="logo" />
        </div>
        <div className={cx('inner')}>

        </div>
    </header>
}

export default Header;