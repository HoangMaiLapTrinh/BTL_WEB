import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import React from 'react';

const cx = classNames.bind(styles);

function Footer() {
    return (
        <footer className={cx('wrapper')}>
            <div className={cx('inner')}>
                <p>© 2023 Your Company. All rights reserved.</p>
                <p>Privacy Policy | Terms of Service</p>
            </div>
        </footer>
    );
}

export default Footer;