import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './ProductDetail.module.scss';
import { showToast } from '../../components/Toast/index.js';
import { API_URL } from '../../services/authService.js';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [slideDirection, setSlideDirection] = useState(''); // 'next' hoặc 'prev' để xác định hướng animation
    const [isAnimating, setIsAnimating] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const extraInfoRef = useRef(null);
    const commentRef = useRef(null);
    const similarProductsRef = useRef(null);
    const autoSlideInterval = useRef(null);
    const topRef = useRef(null);

    // Xử lý chuyển trang và cuộn lên đầu trang khi chọn sản phẩm tương tự
    const handleSimilarProductClick = (e, productId) => {
        e.preventDefault();
        
        // Thêm class animation cho body
        document.body.classList.add('scroll-up-animation');
        
        // Bắt đầu animation cuộn lên đầu trang
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Đặt timeout trước khi chuyển hướng để cho phép animation hoàn tất
        setTimeout(() => {
            // Sau khi animation hoàn tất, chuyển đến trang sản phẩm tương tự
            navigate(`/product/${productId}`);
            
            // Xóa class animation
            setTimeout(() => {
                document.body.classList.remove('scroll-up-animation');
            }, 100);
        }, 600); // Thời gian đợi trước khi chuyển hướng (điều chỉnh để khớp với thời gian animation)
    };

    // Khi chuyển trang sản phẩm, tự động cuộn lên đầu
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });
    }, [id]);

    const toggleExpanded = () => {
        setExpanded((prev) => {
            const newState = !prev;

            setTimeout(() => {
                if (extraInfoRef.current) {
                    extraInfoRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: newState ? 'start' : 'start',
                    });
                }
            }, 300); // delay khớp với CSS

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
    
    // Sử dụng useCallback để tránh tạo lại hàm mỗi lần render
    const handleNextSlide = useCallback(() => {
        if (!similarProducts || similarProducts.length <= 5 || isAnimating) return;
        
        // Thiết lập hướng animation và trạng thái đang animation
        setSlideDirection('next');
        setIsAnimating(true);
        
        // Sau khi animation bắt đầu, cập nhật currentSlide
        setTimeout(() => {
            setCurrentSlide((prev) => {
                const next = prev + 1;
                return next >= similarProducts.length - 4 ? 0 : next;
            });
            
            // Đặt timeout để kết thúc animation sau khi đã chuyển slide
            setTimeout(() => {
                setIsAnimating(false);
            }, 300); // Thời gian animation
        }, 50); // Delay nhỏ để animation bắt đầu trước khi thay đổi slide
    }, [similarProducts, isAnimating]);
    
    const handlePrevSlide = useCallback(() => {
        if (!similarProducts || similarProducts.length <= 5 || isAnimating) return;
        
        // Thiết lập hướng animation và trạng thái đang animation
        setSlideDirection('prev');
        setIsAnimating(true);
        
        // Sau khi animation bắt đầu, cập nhật currentSlide
        setTimeout(() => {
            setCurrentSlide((prev) => {
                const next = prev - 1;
                return next < 0 ? similarProducts.length - 5 : next;
            });
            
            // Đặt timeout để kết thúc animation sau khi đã chuyển slide
            setTimeout(() => {
                setIsAnimating(false);
            }, 300); // Thời gian animation
        }, 50); // Delay nhỏ để animation bắt đầu trước khi thay đổi slide
    }, [similarProducts, isAnimating]);
    
    // Thiết lập interval cho slideshow
    useEffect(() => {
        // Xóa interval cũ nếu có
        if (autoSlideInterval.current) {
            clearInterval(autoSlideInterval.current);
            autoSlideInterval.current = null;
        }
        
        // Chỉ bắt đầu slideshow khi có đủ sản phẩm
        if (similarProducts && similarProducts.length > 5) {
            autoSlideInterval.current = setInterval(() => {
                handleNextSlide();
            }, 5000);
        }
        
        // Dọn dẹp khi component unmount
        return () => {
            if (autoSlideInterval.current) {
                clearInterval(autoSlideInterval.current);
                autoSlideInterval.current = null;
            }
        };
    }, [similarProducts, handleNextSlide]);
    
    // Dừng slideshow khi component không hiển thị
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Trang bị ẩn, dừng auto slide
                if (autoSlideInterval.current) {
                    clearInterval(autoSlideInterval.current);
                    autoSlideInterval.current = null;
                }
            } else if (similarProducts && similarProducts.length > 5) {
                // Trang hiển thị lại, khởi động lại auto slide
                if (autoSlideInterval.current) {
                    clearInterval(autoSlideInterval.current);
                }
                autoSlideInterval.current = setInterval(handleNextSlide, 5000);
            }
        };
        
        document.addEventListener("visibilitychange", handleVisibilityChange);
        
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [similarProducts, handleNextSlide]);

    // Tải dữ liệu sản phẩm
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${API_URL}/products/product/${id}`);
                if (response.data.success) {
                    setProduct(response.data.product);
                    
                    // Sau khi có sản phẩm, lấy các sản phẩm tương tự
                    if (response.data.product && response.data.product.category) {
                        fetchSimilarProducts(response.data.product.category);
                    }
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

        const fetchSimilarProducts = async (categoryId) => {
            if (!categoryId) return;
            
            try {
                // Lấy các sản phẩm cùng danh mục, loại trừ sản phẩm hiện tại
                console.log(`Đang tải sản phẩm tương tự cho danh mục: ${categoryId}`);
                const response = await axios.get(`${API_URL}/products/category/${encodeURIComponent(categoryId)}`);
                if (response.data.success) {
                    // Lọc ra các sản phẩm khác với sản phẩm hiện tại và giới hạn 10 sản phẩm
                    const filtered = response.data.products
                        .filter(prod => prod._id !== id)
                        .slice(0, 10);
                    
                    console.log(`Đã tìm thấy ${filtered.length} sản phẩm tương tự`);
                    setSimilarProducts(filtered);
                }
            } catch (error) {
                console.error('Lỗi khi tải sản phẩm tương tự:', error);
            }
        };

        fetchProduct();
        
        // Kiểm tra trạng thái đăng nhập và quyền admin
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.success) {
                        setIsAuthenticated(true);
                        // Kiểm tra nếu người dùng là admin
                        if (res.data.user && res.data.user.role === 'admin') {
                            setIsAdmin(true);
                        }
                    }
                } catch (error) {
                    console.error('Lỗi xác thực:', error);
                }
            }
        };
        
        checkAuth();
        
        // Cleanup khi component unmount
        return () => {
            if (autoSlideInterval.current) {
                clearInterval(autoSlideInterval.current);
                autoSlideInterval.current = null;
            }
        };
    }, [id]);
    
    // Lấy bình luận
    useEffect(() => {
        const fetchComments = async () => {
            if (!id) return;
            
            setIsLoadingComments(true);
            try {
                const response = await axios.get(`${API_URL}/comments/product/${id}`);
                if (response.data.success) {
                    setComments(response.data.comments);
                }
            } catch (error) {
                console.error('Lỗi khi lấy bình luận:', error);
            } finally {
                setIsLoadingComments(false);
            }
        };
        
        fetchComments();
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
    
    // Xử lý gửi bình luận
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) {
            showToast({
                title: 'Lỗi',
                message: 'Vui lòng nhập nội dung bình luận',
                type: 'error',
            });
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/comments/product/${id}`,
                { content: newComment, rating },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            
            if (response.data.success) {
                // Thêm bình luận mới vào state
                setComments([response.data.comment, ...comments]);
                setNewComment('');
                setRating(5);
                
                showToast({
                    title: 'Thành công',
                    message: 'Đã thêm bình luận thành công',
                    type: 'success',
                });
            }
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            showToast({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi thêm bình luận',
                type: 'error',
            });
        }
    };
    
    // Xử lý xóa bình luận
    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_URL}/comments/${commentId}`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                    withCredentials: true
                }
            );
            
            if (response.data.success) {
                // Lọc bỏ bình luận đã xóa
                setComments(comments.filter(comment => comment._id !== commentId));
                
                showToast({
                    title: 'Thành công',
                    message: 'Đã xóa bình luận thành công',
                    type: 'success',
                });
            }
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            showToast({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi xóa bình luận',
                type: 'error',
            });
        }
    };

    if (loading) {
        return <div className={cx('loading')}>Đang tải...</div>;
    }

    if (!product) {
        return <div className={cx('error')}>Không tìm thấy sản phẩm</div>;
    }

    // Tính toán sản phẩm tương tự hiển thị
    const visibleSimilarProducts = !similarProducts || similarProducts.length <= 5 
        ? similarProducts 
        : similarProducts.slice(currentSlide, currentSlide + 5).length === 5 
            ? similarProducts.slice(currentSlide, currentSlide + 5)
            : [...similarProducts.slice(currentSlide), ...similarProducts.slice(0, 5 - (similarProducts.length - currentSlide))];

    return (
        <div className={cx('product-detail')} ref={topRef}>
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

                <div className={cx('extra-info', { expanded })} style={{ maxHeight: expanded ? '1000px' : '160px' }} ref={extraInfoRef}>
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
            
            {/* Phần bình luận sản phẩm */}
            <div className={cx('comments-section')} ref={commentRef}>
                <h3 className={cx('comments-title')}>Bình luận sản phẩm</h3>
                
                {/* Form nhập bình luận - chỉ hiển thị khi đã đăng nhập */}
                {isAuthenticated ? (
                    <form className={cx('comment-form')} onSubmit={handleSubmitComment}>
                        <div className={cx('rating-control')}>
                            <span>Đánh giá:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                    key={star}
                                    className={cx('star', { active: star <= rating })}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Viết bình luận của bạn..."
                            className={cx('comment-input')}
                            rows={4}
                        />
                        <button type="submit" className={cx('submit-comment')}>
                            Gửi bình luận
                        </button>
                    </form>
                ) : (
                    <div className={cx('login-prompt')}>
                        <p>Vui lòng đăng nhập để viết bình luận</p>
                    </div>
                )}
                
                {/* Danh sách bình luận */}
                <div className={cx('comments-list')}>
                    {isLoadingComments ? (
                        <div className={cx('comments-loading')}>Đang tải bình luận...</div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment._id} className={cx('comment-item')}>
                                <div className={cx('comment-header')}>
                                    <div className={cx('user-info')}>
                                        <div className={cx('avatar')}>
                                            {comment.user.avatar ? (
                                                <img src={comment.user.avatar} alt={comment.user.name} />
                                            ) : (
                                                <div className={cx('avatar-placeholder')}>
                                                    {comment.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className={cx('username')}>{comment.user.name}</span>
                                    </div>
                                    <div className={cx('comment-rating')}>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <span key={index} className={cx('star', { filled: index < comment.rating })}>
                                                ★
                                            </span>
                                        ))}
                                        <span className={cx('comment-date')}>
                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                                <div className={cx('comment-content')}>{comment.content}</div>
                                
                                {/* Nút xóa comment - chỉ hiển thị với admin */}
                                {isAdmin && (
                                    <div className={cx('comment-actions')}>
                                        <button 
                                            className={cx('delete-comment')}
                                            onClick={() => handleDeleteComment(comment._id)}
                                        >
                                            Xóa bình luận
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className={cx('no-comments')}>Chưa có bình luận nào cho sản phẩm này</div>
                    )}
                </div>
            </div>
            
            {/* Phần sản phẩm tương tự */}
            {similarProducts && similarProducts.length > 0 && (
                <div className={cx('similar-products-section')} ref={similarProductsRef}>
                    <h3 className={cx('section-title')}>Sản phẩm tương tự</h3>
                    
                    <div className={cx('similar-products-container')}>
                        {similarProducts.length > 5 && (
                            <button 
                                className={cx('similar-nav-btn', 'left')} 
                                onClick={handlePrevSlide}
                                disabled={isAnimating}
                            >
                                &lt;
                            </button>
                        )}
                        
                        <div 
                            className={cx('similar-products-list', {
                                'slide-next': slideDirection === 'next' && isAnimating,
                                'slide-prev': slideDirection === 'prev' && isAnimating,
                            })}
                        >
                            {visibleSimilarProducts && visibleSimilarProducts.map(similarProduct => (
                                <div
                                    className={cx('similar-product-item')} 
                                    key={similarProduct._id}
                                    onClick={(e) => handleSimilarProductClick(e, similarProduct._id)}
                                >
                                    <div className={cx('similar-product-image')}>
                                        <img 
                                            src={similarProduct.images[0]?.url || 'https://via.placeholder.com/200'} 
                                            alt={similarProduct.name} 
                                        />
                                    </div>
                                    <div className={cx('similar-product-info')}>
                                        <h4 className={cx('similar-product-name')}>{similarProduct.name}</h4>
                                        <div className={cx('similar-product-price')}>
                                            {similarProduct.price.toLocaleString('vi-VN')} VND
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {similarProducts.length > 5 && (
                            <button 
                                className={cx('similar-nav-btn', 'right')} 
                                onClick={handleNextSlide}
                                disabled={isAnimating}
                            >
                                &gt;
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
