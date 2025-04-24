import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './ProductDetail.module.scss';
import { showToast } from '../../components/Toast/index.js';
import { API_URL } from '../../services/authService.js';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const extraInfoRef = useRef(null);

    const toggleExpanded = () => {
        setExpanded(prev => {
            const newState = !prev;
            if (!newState && extraInfoRef.current) {
                // Khi thu gọn, cuộn phần extra-info-wrapper lên đầu
                setTimeout(() => {
                    extraInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else if (newState && extraInfoRef.current) {
                // Khi mở rộng, cuộn xuống như trước
                setTimeout(() => {
                    extraInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
            return newState;
        });
    };
    
    
    const handleThumbnailClick = (index) => {
        setMainImageIndex(index);
    };

    const handleNextImage = () => {
        setMainImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const handlePrevImage = () => {
        setMainImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${API_URL}/products/product/${id}`);
                if (response.data.success) {
                    setProduct(response.data.product);
                } else {
                    showToast({
                        title: 'Lỗi',
                        message: 'Không thể tải thông tin sản phẩm',
                        type: 'error',
                    });
                }
            } catch (error) {
                showToast({
                    title: 'Lỗi',
                    message: 'Đã xảy ra lỗi khi tải sản phẩm',
                    type: 'error',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleQuantityChange = (value) => {
        const newQuantity = quantity + value;
        if (newQuantity > 0 && newQuantity <= (product?.stock || 1)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        // Logic thêm vào giỏ hàng sẽ được thêm sau
        showToast({
            title: 'Thành công',
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            type: 'success',
        });
    };

    if (loading) {
        return <div className={cx('loading')}>Đang tải...</div>;
    }

    if (!product) {
        return <div className={cx('error')}>Không tìm thấy sản phẩm</div>;
    }

    return (
        <div className={cx('product-detail')}>
            <div className={cx('product-container')}>
                <div className={cx('product-images')}>
                    <div className={cx('main-image')}>
                        <button className={cx('nav-btn', 'left')} onClick={handlePrevImage}>
                            &lt;
                        </button>
                        <img
                            src={product.images[mainImageIndex]?.url || 'https://via.placeholder.com/400'}
                            alt={product.name}
                            onClick={openModal}
                            className={cx('zoomable-image')}
                        />
                        <button className={cx('nav-btn', 'right')} onClick={handleNextImage}>
                            &gt;
                        </button>
                    </div>

                    <div className={cx('thumbnail-list')}>
                        {product.images.map((image, index) => (
                            <div
                                key={index}
                                className={cx('thumbnail', { active: index === mainImageIndex })}
                                onClick={() => handleThumbnailClick(index)}
                            >
                                <img src={image.url} alt={`${product.name} ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={cx('product-info')}>
                    <h1 className={cx('product-name')}>{product.name}</h1>
                    <div className={cx('product-price')}>{product.price.toLocaleString('vi-VN')} VND</div>
                    <div className={cx('product-description')}>
                        <h3>Mô tả sản phẩm</h3>
                        <p>{product.description}</p>
                    </div>
                    <div className={cx('product-quantity')}>
                        <h3>Số lượng</h3>
                        <div className={cx('quantity-control')}>
                            <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                -
                            </button>
                            <span>{quantity}</span>
                            <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                                +
                            </button>
                        </div>
                    </div>
                    <button className={cx('add-to-cart')} onClick={handleAddToCart}>
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className={cx('image-modal')} onClick={closeModal}>
                    <img src={product.images[mainImageIndex]?.url} alt={product.name} className={cx('modal-image')} />
                </div>
            )}

            <div className={cx('extra-info-wrapper')}>
                <h3 className={cx('extra-info-title')}>Thông tin bổ sung</h3>

                <div className={cx('extra-info', { expanded })} style={{ maxHeight: expanded ? '1000px' : '400px' }} ref={extraInfoRef}>
                    <table className={cx('info-table')}>
                        <tbody>
                            <tr>
                                <td>Thương Hiệu</td>
                                <td>{product.brand}</td>
                            </tr>
                            <tr>
                                <td>Xuất Xứ</td>
                                <td>{product.xuatXu}</td>
                            </tr>
                            <tr>
                                <td>Giới Tính</td>
                                <td>{product.gioiTinh}</td>
                            </tr>
                            <tr>
                                <td>Màu Sắc</td>
                                <td>{product.mauSac}</td>
                            </tr>
                            <tr>
                                <td>Kiểu Dáng</td>
                                <td>{product.kieuDang}</td>
                            </tr>
                            <tr>
                                <td>Chất Liệu</td>
                                <td>{product.chatLieu}</td>
                            </tr>
                            <tr>
                                <td>Size</td>
                                <td>{product.size}</td>
                            </tr>
                            
                        </tbody>
                    </table>

                    {!expanded && <div className={cx('info-blur')} />}
                </div>

                <button className={cx('toggle-btn')} onClick={toggleExpanded}>
                    {expanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                </button>
            </div>
        </div>
    );
}

export default ProductDetail;
