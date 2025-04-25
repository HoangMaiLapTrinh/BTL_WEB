import React, { useEffect } from 'react';
import * as styles from './Toast.module.scss';
import classNames from 'classnames/bind';
import '@fortawesome/fontawesome-free/css/all.min.css';

const cx = classNames.bind(styles);

// Hàm kiểm tra xem thiết bị hiện tại có phải là mobile không
const isMobileDevice = () => {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Lưu trữ thông báo gần đây để tránh hiển thị trùng lặp
const recentToasts = new Map();

export function showToast({ title = "", message = "", type = "info", duration = 3000, position = "top-right" }) {
    const main = document.getElementById("toast-container");
    const isMobile = isMobileDevice();
    
    // Tạo key duy nhất cho thông báo
    const toastKey = `${title}-${message}-${type}`;
    
    // Kiểm tra xem thông báo đã hiển thị gần đây chưa
    const now = Date.now();
    if (recentToasts.has(toastKey)) {
        const lastShown = recentToasts.get(toastKey);
        if (now - lastShown < 3000) { // Chỉ hiển thị lại thông báo sau 3 giây
            console.log('Đã chặn toast trùng lặp:', toastKey);
            return; // Không hiển thị thông báo trùng lặp
        }
    }
    
    // Lưu thời gian hiển thị thông báo
    recentToasts.set(toastKey, now);
    
    // Xóa các thông báo cũ sau 10 giây
    setTimeout(() => {
        recentToasts.delete(toastKey);
    }, 10000);
    
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
        
        // Điều chỉnh animation dựa trên thiết bị
        if (isMobile) {
            // Thiết bị di động sẽ slide từ dưới lên
            toast.style.animation = `slideInBottom ease .3s, fadeOut linear 1s ${delay}s forwards`;
            toast.classList.add(cx('toast--mobile'));
        } else {
            // Desktop sẽ slide từ phải qua
            toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
        }
    
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
        
        // Xử lý sự kiện click trên mobile
        if (isMobile) {
            // Cho phép tap để tạm dừng biến mất
            toast.addEventListener('touchstart', function() {
                clearTimeout(autoRemoveId);
            });
            
            // Khi thả tay, tiếp tục hẹn giờ biến mất
            toast.addEventListener('touchend', function() {
                const newAutoRemoveId = setTimeout(function () {
                    toast.classList.add(cx('hide'));
                    setTimeout(() => {
                        if (main.contains(toast)) {
                            main.removeChild(toast);
                        }
                    }, 500);
                }, duration / 2); // Giảm thời gian còn nửa
            });
        } else {
            // Các sự kiện cho desktop
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
}

function Toast() {
    // Sử dụng useEffect để tạo container cho toast
    useEffect(() => {
        // Kiểm tra xem toast-container đã tồn tại chưa
        if (!document.getElementById("toast-container")) {
            const container = document.createElement('div');
            container.id = "toast-container";
            container.className = cx('toast-container');
            document.body.appendChild(container);
            
            console.log("Toast container created");
        } else {
            console.log("Toast container already exists");
        }
        
        // Clean up khi component unmount - chúng ta không xóa container khi component unmount
        // vì điều này có thể gây ra lỗi nếu component được mount/unmount nhiều lần
        // Thay vào đó chúng ta chỉ xóa khi ứng dụng đóng
        return () => {
            // Không xóa container khi component unmount
            // Chỉ log để debug
            console.log("Toast component unmounted, container preserved");
        };
    }, []);
    
    return null; // Component không render bất kỳ phần tử nào
}

export default Toast; 