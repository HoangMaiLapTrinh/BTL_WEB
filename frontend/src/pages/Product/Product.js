import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import * as styles from './Product.module.scss';
import { getProducts, getProductsByCategory } from '../../services/productService.js';
import { showToast } from '../../components/Toast/index.js';

const cx = classNames.bind(styles);

const Product = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category');
    const brandParam = searchParams.get('brand');
    const genderParam = searchParams.get('gender');
    const navigate = useNavigate();
    const location = useLocation();
    
    // Các state cho bộ lọc
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedGender, setSelectedGender] = useState('');
    const [sortOption, setSortOption] = useState('default');
    
    // Danh sách các thương hiệu và giới tính từ dữ liệu sản phẩm
    const [brands, setBrands] = useState([]);
    const genders = ['Nam', 'Nữ', 'Unisex'];

    // Lấy dữ liệu sản phẩm khi component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await getProducts();
                
                if (response.success) {
                    const productsData = response.products || [];
                    setProducts(productsData);
                    
                    // Trích xuất danh sách thương hiệu
                    const brandList = [...new Set(productsData.map(product => 
                        product.brand ? product.brand.trim() : null
                    ).filter(brand => brand))];
                    
                    setBrands(brandList);
                    
                    // Nếu có brandParam, nhưng chưa update selectedBrands
                    if (brandParam && !selectedBrands.length) {
                        const matchingBrand = brandList.find(brand => 
                            brand.toLowerCase() === brandParam.toLowerCase()
                        );
                        
                        if (matchingBrand) {
                            setSelectedBrands([matchingBrand]);
                        } else {
                            setSelectedBrands([brandParam]);
                        }
                    }
                    
                    showToast({
                        title: "Thành công",
                        message: "Đã tải sản phẩm thành công!",
                        type: "success",
                        duration: 2000
                    });
                } else {
                    setError('Không thể tải danh sách sản phẩm');
                }
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi tải sản phẩm:', error);
                setError('Đã xảy ra lỗi khi tải danh sách sản phẩm');
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

    // Cập nhật useEffect xử lý khi URL thay đổi
    useEffect(() => {
        console.log("URL params đã thay đổi:");
        console.log("Brand param:", brandParam);
        console.log("Gender param:", genderParam);
        
        // Cập nhật bộ lọc thương hiệu từ URL param
        if (brandParam) {
            // Tìm thương hiệu chính xác trong danh sách brands
            const matchingBrand = brands.find(brand => 
                brand.toLowerCase() === brandParam.toLowerCase()
            );
            
            if (matchingBrand) {
                console.log(`Tìm thấy thương hiệu chính xác: ${matchingBrand}`);
                setSelectedBrands([matchingBrand]);
            } else {
                console.log(`Không tìm thấy thương hiệu chính xác cho: ${brandParam}`);
                // Nếu không tìm thấy, sử dụng brandParam
                setSelectedBrands([brandParam]);
            }
        } else {
            setSelectedBrands([]);
        }
        
        // Cập nhật bộ lọc giới tính từ URL param
        if (genderParam) {
            console.log(`Đặt giới tính đã chọn: ${genderParam}`);
            setSelectedGender(genderParam);
        } else {
            setSelectedGender('');
        }
    }, [brandParam, genderParam, brands]);
    
    // Lọc sản phẩm khi các lựa chọn lọc thay đổi
    useEffect(() => {
        if (products.length === 0) return;
        
        let result = [...products];
        
        // Lọc theo giá
        result = result.filter(product => 
            product.price >= priceRange.min && product.price <= priceRange.max
        );
        
        // Lọc theo thương hiệu (không phân biệt chữ hoa/thường)
        if (selectedBrands.length > 0) {
            result = result.filter(product => {
                if (!product.brand) return false;
                return selectedBrands.some(brand => 
                    product.brand.toLowerCase() === brand.toLowerCase()
                );
            });
        }
        
        // Lọc theo giới tính
        if (selectedGender) {
            result = result.filter(product => {
                if (!product.gioiTinh) return false;
                return product.gioiTinh.toLowerCase() === selectedGender.toLowerCase();
            });
        }
        
        // Sắp xếp
        switch(sortOption) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Không sắp xếp
                break;
        }
        
        setFilteredProducts(result);
    }, [products, priceRange, selectedBrands, selectedGender, sortOption]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };
    
    // Cập nhật URL khi thay đổi bộ lọc thương hiệu
    const handleBrandChange = (brand) => {
        let newBrands = [...selectedBrands];
        
        // Kiểm tra xem brand đã được chọn chưa (không phân biệt hoa thường)
        const isSelected = selectedBrands.some(selected => 
            selected.toLowerCase() === brand.toLowerCase()
        );
        
        if (isSelected) {
            // Nếu đã chọn thì bỏ chọn
            newBrands = newBrands.filter(selected => 
                selected.toLowerCase() !== brand.toLowerCase()
            );
        } else {
            // Nếu chưa chọn thì thêm vào
            newBrands.push(brand);
        }
        
        setSelectedBrands(newBrands);
        
        // Cập nhật URL
        updateUrlParams(newBrands.length > 0 ? newBrands[0] : null, selectedGender);
    };
    
    // Cập nhật URL khi thay đổi bộ lọc giới tính
    const handleGenderChange = (gender) => {
        const newGender = selectedGender === gender ? '' : gender;
        setSelectedGender(newGender);
        
        // Cập nhật URL
        updateUrlParams(selectedBrands.length > 0 ? selectedBrands[0] : null, newGender);
    };
    
    // Hàm cập nhật URL params
    const updateUrlParams = (brand, gender) => {
        const params = new URLSearchParams();
        
        if (brand) {
            params.set('brand', brand);
        }
        
        if (gender) {
            params.set('gender', gender);
        }
        
        // Thêm category param nếu có
        if (categoryId) {
            params.set('category', categoryId);
        }
        
        const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`;
        navigate(newUrl, { replace: true });
    };
    
    const handlePriceChange = (e, type) => {
        const value = parseInt(e.target.value);
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };
    
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };
    
    const clearFilters = () => {
        setPriceRange({ min: 0, max: 100000000 });
        setSelectedBrands([]);
        setSelectedGender('');
        setSortOption('default');
        // Cập nhật URL để xóa các tham số lọc
        navigate('/products', { replace: true });
    };

    // Tạo tiêu đề trang dựa trên các bộ lọc
    const getPageTitle = () => {
        if (selectedGender && selectedGender === 'Nam') {
            return 'Sản phẩm dành cho Nam';
        } else if (selectedGender && selectedGender === 'Nữ') {
            return 'Sản phẩm dành cho Nữ';
        } else if (selectedBrands.length === 1) {
            return `Sản phẩm thương hiệu ${selectedBrands[0]}`;
        } else if (categoryId) {
            return 'Sản phẩm theo danh mục';
        } else {
            return 'Tất cả sản phẩm';
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <h2 className={cx('section-title')}>
                    {getPageTitle()}
                </h2>
                
                <div className={cx('content-wrapper')}>
                    {/* Phần bộ lọc bên trái */}
                    <div className={cx('filter-sidebar')}>
                        <div className={cx('filter-box')}>
                            <h3 className={cx('filter-title')}>Bộ lọc sản phẩm</h3>
                            
                            <div className={cx('filter-section')}>
                                <h4>Khoảng giá</h4>
                                <div className={cx('price-inputs')}>
                                    <div className={cx('price-input')}>
                                        <label>Từ:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={priceRange.min}
                                            onChange={(e) => handlePriceChange(e, 'min')}
                                        />
                                    </div>
                                    <div className={cx('price-input')}>
                                        <label>Đến:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={priceRange.max}
                                            onChange={(e) => handlePriceChange(e, 'max')}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {brands.length > 0 && (
                                <div className={cx('filter-section')}>
                                    <h4>Thương hiệu</h4>
                                    <div className={cx('brand-list')}>
                                        {brands.map((brand, index) => (
                                            <div key={index} className={cx('brand-item')}>
                                                <input
                                                    type="checkbox"
                                                    id={`brand-${index}`}
                                                    checked={selectedBrands.some(selected => 
                                                        selected.toLowerCase() === brand.toLowerCase()
                                                    )}
                                                    onChange={() => handleBrandChange(brand)}
                                                />
                                                <label htmlFor={`brand-${index}`}>{brand}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className={cx('filter-section')}>
                                <h4>Giới tính</h4>
                                <div className={cx('gender-list')}>
                                    {genders.map((gender, index) => (
                                        <div key={index} className={cx('gender-item')}>
                                            <input
                                                type="radio"
                                                id={`gender-${index}`}
                                                checked={selectedGender === gender}
                                                onChange={() => handleGenderChange(gender)}
                                                name="gender"
                                            />
                                            <label htmlFor={`gender-${index}`}>{gender}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className={cx('filter-section')}>
                                <h4>Sắp xếp</h4>
                                <select 
                                    className={cx('sort-select')} 
                                    value={sortOption}
                                    onChange={handleSortChange}
                                >
                                    <option value="default">Mặc định</option>
                                    <option value="price-asc">Giá: Thấp đến cao</option>
                                    <option value="price-desc">Giá: Cao đến thấp</option>
                                    <option value="name-asc">Tên: A-Z</option>
                                    <option value="name-desc">Tên: Z-A</option>
                                </select>
                            </div>
                            
                            <button 
                                className={cx('clear-filter')}
                                onClick={clearFilters}
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                
                    {/* Phần hiển thị sản phẩm bên phải */}
                    <div className={cx('products-container')}>
                        {loading ? (
                            <div className={cx('loading')}>Đang tải sản phẩm...</div>
                        ) : error ? (
                            <div className={cx('error')}>{error}</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className={cx('no-products')}>Không có sản phẩm nào phù hợp với bộ lọc</div>
                        ) : (
                            <>
                                <div className={cx('products-count')}>
                                    Hiển thị {filteredProducts.length} sản phẩm
                                </div>
                                <div className={cx('products-grid')}>
                                    {filteredProducts.map(product => (
                                        <div 
                                            key={product._id} 
                                            className={cx('product-item')}
                                            onClick={() => handleProductClick(product._id)}
                                        >
                                            <div className={cx('product-link')}>
                                                <div className={cx('product-image')}>
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0].url} alt={product.name} />
                                                    ) : (
                                                        <img src="https://via.placeholder.com/300x400" alt="Placeholder" />
                                                    )}
                                                </div>
                                                <div className={cx('product-info')}>
                                                    <h3 className={cx('product-name')}>{product.name}</h3>
                                                    <p className={cx('product-price')}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                    </p>
                                                    {product.brand && (
                                                        <p className={cx('product-brand')}>{product.brand}</p>
                                                    )}
                                                    {product.gioiTinh && (
                                                        <span className={cx('product-gender')}>{product.gioiTinh}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;
