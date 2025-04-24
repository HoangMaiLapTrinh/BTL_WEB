import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './Home.module.scss';
import { useSlider } from './home.js';
import ProductItem from '../../components/ProductItem/index.js';
import { API_URL } from '../../services/authService.js';

const cx = classNames.bind(styles);

function Home() {
    const { currentSlide, slides, goToSlide, goToPrevSlide, goToNextSlide } = useSlider();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/products/products`);
                if (response.data.success) {
                    setProducts(response.data.products);
                }
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm:', error);
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={styles.slider}>
                <div 
                    className={styles.slides}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div key={index} className={styles.slide}>
                            <img src={slide.image} alt={`Slide ${index + 1}`} />
                            <div className={styles.slideContent}>
                                <h2>{slide.title}</h2>
                                <p>{slide.description}</p>
                                <button>{slide.buttonText}</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.controls}>
                    <div className={styles.control} onClick={goToPrevSlide}>
                        &lt;
                    </div>
                    <div className={styles.control} onClick={goToNextSlide}>
                        &gt;
                    </div>
                </div>

                <div className={styles.dots}>
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            </div>
            
            <div className={cx('container')}>
                <h2 className={cx('section-title')}>Sản phẩm nổi bật</h2>
                
                {loading ? (
                    <div className={cx('loading')}>Đang tải sản phẩm...</div>
                ) : error ? (
                    <div className={cx('error')}>{error}</div>
                ) : (
                    <div className={cx('products-grid')}>
                        {products.map(product => (
                            <ProductItem key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;

