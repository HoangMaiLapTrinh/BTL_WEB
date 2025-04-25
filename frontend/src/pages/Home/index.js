import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './Home.module.scss';
import { useSlider } from './home.js';
import ProductItem from '../../components/ProductItem/index.js';
import { API_URL } from '../../services/authService.js';
import { showToast } from '../../components/Toast/index.js';
// Import logo images
import logoAdidas from '../../img/Logo/logo_adidas.png';
import logoBalenciaga from '../../img/Logo/logo_balenciaga.png';
import logoDior from '../../img/Logo/logo_dior.png';
import logoGucci from '../../img/Logo/logo_gucci.jpg';
import logoLV from '../../img/Logo/logo_lv.jpg';
import logoNike from '../../img/Logo/logo_nike.png';
import logoPrada from '../../img/Logo/logo_prada.png';

const cx = classNames.bind(styles);

function Home() {
    const { currentSlide, slides, goToSlide, goToPrevSlide, goToNextSlide } = useSlider();
    const [products, setProducts] = useState([]);
    const [nikeProducts, setNikeProducts] = useState([]);
    const [gucciProducts, setGucciProducts] = useState([]);
    const [diorProducts, setDiorProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const brands = [
        { name: 'Adidas', logo: logoAdidas },
        { name: 'Balenciaga', logo: logoBalenciaga },
        { name: 'Dior', logo: logoDior },
        { name: 'Gucci', logo: logoGucci },
        { name: 'Louis Vuitton', logo: logoLV },
        { name: 'Nike', logo: logoNike },
        { name: 'Prada', logo: logoPrada }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/products/products`);
                if (response.data.success) {
                    setProducts(response.data.products);
                    const nikeProds = response.data.products.filter(product => 
                        product.brand && product.brand.toLowerCase() === 'nike'
                    );
                    const gucciProds = response.data.products.filter(product => 
                        product.brand && product.brand.toLowerCase() === 'gucci'
                    );
                    const diorProds = response.data.products.filter(product => 
                        product.brand && product.brand.toLowerCase() === 'dior'
                    );
                    setNikeProducts(nikeProds);
                    setGucciProducts(gucciProds);
                    setDiorProducts(diorProds);
                    showToast({
                        title: "Thành công",
                        message: "Đã tải sản phẩm thành công!",
                        type: "success",
                        duration: 2000
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm:', error);
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
                setLoading(false);
                showToast({
                    title: "Lỗi",
                    message: "Không thể tải sản phẩm. Vui lòng thử lại sau!",
                    type: "error",
                    duration: 3000
                });
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
                        {products.slice(0, 5).map(product => (
                            <ProductItem key={product._id} product={product} />
                        ))}
                    </div>
                )}

                <h2 className={cx('section-title')}>Nike</h2>
                {loading ? (
                    <div className={cx('loading')}>Đang tải sản phẩm...</div>
                ) : error ? (
                    <div className={cx('error')}>{error}</div>
                ) : nikeProducts.length === 0 ? (
                    <div className={cx('no-products')}>Không có sản phẩm Nike</div>
                ) : (
                    <div className={cx('products-grid')}>
                        {nikeProducts.slice(0, 5).map(product => (
                            <ProductItem key={product._id} product={product} />
                        ))}
                    </div>
                )}

                <h2 className={cx('section-title')}>Gucci</h2>
                {loading ? (
                    <div className={cx('loading')}>Đang tải sản phẩm...</div>
                ) : error ? (
                    <div className={cx('error')}>{error}</div>
                ) : gucciProducts.length === 0 ? (
                    <div className={cx('no-products')}>Không có sản phẩm Gucci</div>
                ) : (
                    <div className={cx('products-grid')}>
                        {gucciProducts.slice(0, 5).map(product => (
                            <ProductItem key={product._id} product={product} />
                        ))}
                    </div>
                )}

                <h2 className={cx('section-title')}>Dior</h2>
                {loading ? (
                    <div className={cx('loading')}>Đang tải sản phẩm...</div>
                ) : error ? (
                    <div className={cx('error')}>{error}</div>
                ) : diorProducts.length === 0 ? (
                    <div className={cx('no-products')}>Không có sản phẩm Dior</div>
                ) : (
                    <div className={cx('products-grid')}>
                        {diorProducts.slice(0, 5).map(product => (
                            <ProductItem key={product._id} product={product} />
                        ))}
                    </div>
                )}

                <h2 className={cx('section-title')}>Thương hiệu của chúng tôi</h2>
                <div className={cx('brands-container')}>
                    {brands.map((brand, index) => (
                        <div key={index} className={cx('brand-item')}>
                            <img src={brand.logo} alt={brand.name} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;

