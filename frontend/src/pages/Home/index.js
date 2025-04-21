import React from 'react';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';

const cx = classNames.bind(styles);

function Home() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <h1>Trang chủ</h1>
            </div>
        </div>
    );
}

export default Home;

