import React from 'react';
import { showToast } from '../../components/Toast';
import classNames from 'classnames/bind';
import * as styles from './Admin.module.scss';

const cx = classNames.bind(styles);

function Admin() {
    const handleShowToast = (type) => {
        switch(type) {
            case 'success':
                showToast({
                    title: "Thành công",
                    message: "Thao tác thành công!",
                    type: "success",
                    duration: 3000
                });
                break;
            case 'error':
                showToast({
                    title: "Lỗi",
                    message: "Đã xảy ra lỗi!",
                    type: "error", 
                    duration: 3000
                });
                break;
            case 'warning':
                showToast({
                    title: "Cảnh báo",
                    message: "Cảnh báo quan trọng!",
                    type: "warning",
                    duration: 3000
                });
                break;
            default:
                showToast({
                    title: "Thông báo",
                    message: "Đây là một thông báo!",
                    type: "info",
                    duration: 3000
                });
        }
    };

    return (
        <div className={cx('admin-container')}>
            <h1>Trang quản trị</h1>
            <div className={cx('toast-demo')}>
                <h2>Demo Toast</h2>
                <div className={cx('buttons')}>
                    <button 
                        className={cx('toast-btn', 'success')}
                        onClick={() => handleShowToast('success')}
                    >
                        Hiển thị Toast thành công
                    </button>
                    <button 
                        className={cx('toast-btn', 'error')}
                        onClick={() => handleShowToast('error')}
                    >
                        Hiển thị Toast lỗi
                    </button>
                    <button 
                        className={cx('toast-btn', 'warning')}
                        onClick={() => handleShowToast('warning')}
                    >
                        Hiển thị Toast cảnh báo
                    </button>
                    <button 
                        className={cx('toast-btn', 'info')}
                        onClick={() => handleShowToast('info')}
                    >
                        Hiển thị Toast thông báo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Admin;
