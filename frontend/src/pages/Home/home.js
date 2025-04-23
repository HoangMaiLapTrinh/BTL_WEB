import { useState, useEffect } from 'react';

export const useSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        {
            image: '/img/banner/banner_dior.jpg',
            title: 'Chào mừng đến với cửa hàng của chúng tôi',
            description: 'Khám phá những sản phẩm mới nhất với giá ưu đãi',
            buttonText: 'Mua ngay'
        },
        {
            image: '/img/banner/banner_balenciaga.jpg',
            title: 'Ưu đãi đặc biệt',
            description: 'Giảm giá lên đến 50% cho tất cả sản phẩm',
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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToPrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    return {
        currentSlide,
        slides,
        goToSlide,
        goToPrevSlide,
        goToNextSlide
    };
}; 