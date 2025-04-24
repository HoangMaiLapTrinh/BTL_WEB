import React, { useEffect } from 'react';
import * as styles from './Toast.module.scss';
import classNames from 'classnames/bind';
import '@fortawesome/fontawesome-free/css/all.min.css';

const cx = classNames.bind(styles);

export function showToast({ title = "", message = "", type = "info", duration = 3000 }) {
    const main = document.getElementById("toast-container");
        
    if (main) {
        const toast = document.createElement("div");
        
        // Auto remove toast
        const autoRemoveId = setTimeout(function () {
            toast.classList.add(cx('hide'));
            setTimeout(() => {
                if (main.contains(toast)) {
                    main.removeChild(toast);
                }
            }, 500);
        }, duration);
    
        // Xử lý sự kiện khi nhấn nút đóng (X)
        const handleClose = function() {
            toast.classList.add(cx('hide'));
            clearTimeout(autoRemoveId);
            setTimeout(() => {
                if (main.contains(toast)) {
                    main.removeChild(toast);
                    console.log("Đã đóng thông báo");
                }
            }, 500);
        };
    
        const icons = {
            success: "fas fa-check-circle",
            info: "fas fa-info-circle",
            warning: "fas fa-exclamation-circle",
            error: "fas fa-exclamation-circle"
        };
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);
    
        toast.classList.add(cx('toast'), cx(`toast--${type}`));
        toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
    
        toast.innerHTML = `
            <div class="${cx('toast__icon')}">
                <i class="${icon}"></i>
            </div>
            <div class="${cx('toast__body')}">
                <h3 class="${cx('toast__title')}">${title}</h3>
                <p class="${cx('toast__msg')}">${message}</p>
            </div>
            <div class="${cx('toast__close')}">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // Đặt sự kiện click cho nút đóng
        main.appendChild(toast);
        
        const closeButton = toast.querySelector(`.${cx('toast__close')}`);
        if (closeButton) {
            closeButton.addEventListener('click', handleClose);
        }
        
        // Thêm sự kiện khi hover vào toast
        toast.addEventListener('mouseenter', function() {
            clearTimeout(autoRemoveId);
        });
        
        toast.addEventListener('mouseleave', function() {
            const newAutoRemoveId = setTimeout(function () {
                toast.classList.add(cx('hide'));
                setTimeout(() => {
                    if (main.contains(toast)) {
                        main.removeChild(toast);
                    }
                }, 500);
            }, duration);
        });
    }
}

function Toast() {
    return (
        <div id="toast-container" className={cx('toast-container')}></div>
    );
}

export default Toast; 