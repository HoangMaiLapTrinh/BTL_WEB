import { useState, useEffect, useRef } from 'react';

export const useSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const autoPlayRef = useRef(null);
    const autoPlayIntervalRef = useRef(null);
    const isMobileRef = useRef(window.innerWidth <= 768);
    
    const slides = [
        {
            image: '/img/banner/banner_dior.jpg',
            title: 'Chào mừng đến với cửa hàng',
            description: 'Khám phá sản phẩm mới với giá ưu đãi',
            buttonText: 'Mua ngay'
        },
        {
            image: '/img/banner/banner_balenciaga.jpg',
            title: 'Ưu đãi đặc biệt',
            description: 'Giảm giá đến 50% cho tất cả sản phẩm',
            buttonText: 'Xem ngay'
        },
        {
            image: '/img/banner/banner_nike.jpg',
            title: 'Sản phẩm chất lượng',
            description: 'Cam kết chất lượng và dịch vụ tốt nhất',
            buttonText: 'Tìm hiểu thêm'
        },
        {
            image: '/img/banner/banner_lv.jpg',
            title: 'Phong cách thời thượng',
            description: 'Khám phá bộ sưu tập mới nhất',
            buttonText: 'Khám phá'
        },
        {
            image: '/img/banner/banner_prada.jpg',
            title: 'Sang trọng và đẳng cấp',
            description: 'Sản phẩm chất lượng cao',
            buttonText: 'Mua ngay'
        },
        {
            image: '/img/banner/banner-gucci.jpg',
            title: 'Thời trang Gucci',
            description: 'Phong cách và đẳng cấp',
            buttonText: 'Xem ngay'
        },
        {
            image: '/img/banner/banner_adidas.webp',
            title: 'Thể thao và năng động',
            description: 'Sản phẩm thể thao chất lượng',
            buttonText: 'Tìm hiểu thêm'
        }
    ];

    // Hàm xử lý cho autoplay
    const autoPlay = () => {
        if (!isUserInteracting) {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }
    };

    // Xử lý autoplay: Chỉ autoplay khi không có tương tác của người dùng
    useEffect(() => {
        autoPlayRef.current = autoPlay;
    }, [isUserInteracting]);

    useEffect(() => {
        const startAutoPlay = () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
            
            autoPlayIntervalRef.current = setInterval(() => {
                autoPlayRef.current();
            }, isMobileRef.current ? 4000 : 5000);
        };
        
        // Bắt đầu autoplay nếu không phải mobile
        if (typeof window !== 'undefined') {
            startAutoPlay();
            
            // Lắng nghe sự kiện scroll toàn trang
            const handlePageScroll = () => {
                setIsUserInteracting(true);
                if (autoPlayIntervalRef.current) {
                    clearInterval(autoPlayIntervalRef.current);
                }
                
                // Sau 10 giây không tương tác, khôi phục autoplay
                setTimeout(() => {
                    setIsUserInteracting(false);
                    startAutoPlay();
                }, 10000);
            };
            
            window.addEventListener('scroll', handlePageScroll);
            
            // Cleanup
            return () => {
                if (autoPlayIntervalRef.current) {
                    clearInterval(autoPlayIntervalRef.current);
                }
                window.removeEventListener('scroll', handlePageScroll);
            };
        }
    }, []);

    // Xử lý sự kiện chạm (cho mobile)
    const handleTouchStart = (e) => {
        setIsUserInteracting(true);
        setTouchStart(e.targetTouches[0].clientX);
        
        // Dừng autoplay khi người dùng tương tác
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) {
            // vuốt sang trái (next slide)
            goToNextSlide();
        } else if (touchStart - touchEnd < -75) {
            // vuốt sang phải (prev slide)
            goToPrevSlide();
        }
        
        // Sau 10 giây không tương tác, đánh dấu là không còn tương tác
        setTimeout(() => {
            setIsUserInteracting(false);
            
            // Khôi phục autoplay
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
            
            autoPlayIntervalRef.current = setInterval(() => {
                autoPlayRef.current();
            }, isMobileRef.current ? 4000 : 5000);
        }, 10000);
    };

    const goToSlide = (index) => {
        setIsUserInteracting(true);
        setCurrentSlide(index);
        
        // Tạm dừng autoplay khi người dùng tương tác
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
        
        // Khôi phục autoplay sau 10 giây
        setTimeout(() => {
            setIsUserInteracting(false);
            
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
            
            autoPlayIntervalRef.current = setInterval(() => {
                autoPlayRef.current();
            }, isMobileRef.current ? 4000 : 5000);
        }, 10000);
    };

    const goToPrevSlide = () => {
        setIsUserInteracting(true);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        
        // Logic tương tự như goToSlide
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
        
        setTimeout(() => {
            setIsUserInteracting(false);
            
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
            
            autoPlayIntervalRef.current = setInterval(() => {
                autoPlayRef.current();
            }, isMobileRef.current ? 4000 : 5000);
        }, 10000);
    };

    const goToNextSlide = () => {
        setIsUserInteracting(true);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        
        // Logic tương tự như goToSlide
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
        
        setTimeout(() => {
            setIsUserInteracting(false);
            
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
            
            autoPlayIntervalRef.current = setInterval(() => {
                autoPlayRef.current();
            }, isMobileRef.current ? 4000 : 5000);
        }, 10000);
    };

    // Cập nhật kích thước màn hình khi resize
    useEffect(() => {
        const handleResize = () => {
            isMobileRef.current = window.innerWidth <= 768;
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        currentSlide,
        slides,
        goToSlide,
        goToPrevSlide,
        goToNextSlide,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    };
}; 