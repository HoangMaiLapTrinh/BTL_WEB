import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import * as styles from './Product.module.scss';
import { getProducts, getProductsByCategory } from '../../services/productService.js';
import { showToast } from '../../components/Toast/index.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';

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
    const searchParam = searchParams.get('search');
    const navigate = useNavigate();
    const location = useLocation();
    
    // Thêm state để kiểm soát hiển thị bộ lọc trên mobile
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);
    
    // Các state cho bộ lọc
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedGender, setSelectedGender] = useState('');
    const [sortOption, setSortOption] = useState('default');
    
    // Danh sách các thương hiệu và giới tính từ dữ liệu sản phẩm
    const [brands, setBrands] = useState([]);
    const genders = ['Nam', 'Nữ', 'Unisex'];

    // Thêm state cho kết quả tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    // State cho hiển thị filter sidebar trên mobile
    const filterButtonRef = useRef(null);
    const filterBoxRef = useRef(null);
    
    // State cho việc hiển thị các section trong filter
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        brand: true,
        gender: true,
        sort: true
    });
    
    // Toggle section trong filter
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    
    // Toggle hiển thị bộ lọc trên mobile
    const toggleFiltersMobile = () => {
        setShowFiltersMobile(prev => !prev);
    };
    
    // Tạo nút filter cố định tương tự như toast container
    useEffect(() => {
        // Kiểm tra nếu nút filter đã tồn tại
        if (!document.getElementById("fixed-filter-button")) {
            // Tạo nút filter
            const button = document.createElement('button');
            button.id = "fixed-filter-button";
            button.className = cx('filter-toggle-mobile');
            
            // Thêm icon và label
            button.innerHTML = `
                <i class="fas ${showFiltersMobile ? 'fa-times' : 'fa-filter'}"></i>
                <span class="${cx('filter-label')}">BỘ LỌC</span>
            `;
            
            // Gắn sự kiện click
            button.addEventListener('click', toggleFiltersMobile);
            
            // Thêm vào body
            document.body.appendChild(button);
            
            // Lưu reference
            filterButtonRef.current = button;
        }
        
        // Cập nhật icon khi state thay đổi
        if (filterButtonRef.current) {
            const iconElement = filterButtonRef.current.querySelector('i');
            if (iconElement) {
                iconElement.className = `fas ${showFiltersMobile ? 'fa-times' : 'fa-filter'}`;
            }
        }
        
        // Dọn dẹp khi component unmount
        return () => {
            // Chỉ xóa nút nếu component unmount
            const filterButton = document.getElementById("fixed-filter-button");
            if (filterButton) {
                filterButton.remove();
            }
        };
    }, [showFiltersMobile]);
    
    // Tạo filter box di động giống toast
    useEffect(() => {
        if (showFiltersMobile) {
            // Nếu filter box chưa tồn tại và cần hiển thị
            if (!document.getElementById("floating-filter-box")) {
                // Tạo filter box container
                const filterBox = document.createElement('div');
                filterBox.id = "floating-filter-box";
                filterBox.className = cx('floating-filter-box');
                
                // Tạo nội dung HTML cho filter box
                filterBox.innerHTML = `
                    <div class="${cx('filter-box-header')}">
                        <h3>Bộ lọc sản phẩm</h3>
                        <button class="${cx('close-filter-btn')}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="${cx('filter-box-content')}">
                        <!-- Khoảng giá -->
                        <div class="${cx('filter-section')}">
                            <div class="${cx('filter-section-header')}" data-section="price">
                                <h4>Khoảng giá</h4>
                                <i class="fas fa-chevron-down ${expandedSections.price ? cx('rotate') : ''}"></i>
                            </div>
                            <div class="${cx('filter-section-content', {'collapsed': !expandedSections.price})}">
                                <div class="${cx('price-inputs')}">
                                    <div class="${cx('price-input')}">
                                        <label>Từ:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value="${priceRange.min}"
                                            id="price-min"
                                        />
                                    </div>
                                    <div class="${cx('price-input')}">
                                        <label>Đến:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value="${priceRange.max}"
                                            id="price-max"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Thương hiệu -->
                        <div class="${cx('filter-section')}">
                            <div class="${cx('filter-section-header')}" data-section="brand">
                                <h4>Thương hiệu</h4>
                                <i class="fas fa-chevron-down ${expandedSections.brand ? cx('rotate') : ''}"></i>
                            </div>
                            <div class="${cx('filter-section-content', {'collapsed': !expandedSections.brand})}">
                                <div class="${cx('brand-list')}">
                                    ${brands.map((brand, index) => `
                                        <div class="${cx('brand-item')}">
                                            <input
                                                type="checkbox"
                                                id="brand-${index}"
                                                ${selectedBrands.some(selected => 
                                                    selected.toLowerCase() === brand.toLowerCase()
                                                ) ? 'checked' : ''}
                                                data-brand="${brand}"
                                            />
                                            <label for="brand-${index}">${brand}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Giới tính -->
                        <div class="${cx('filter-section')}">
                            <div class="${cx('filter-section-header')}" data-section="gender">
                                <h4>Giới tính</h4>
                                <i class="fas fa-chevron-down ${expandedSections.gender ? cx('rotate') : ''}"></i>
                            </div>
                            <div class="${cx('filter-section-content', {'collapsed': !expandedSections.gender})}">
                                <div class="${cx('gender-list')}">
                                    ${genders.map((gender, index) => `
                                        <div class="${cx('gender-item')}">
                                            <input
                                                type="radio"
                                                id="gender-${index}"
                                                name="gender"
                                                ${selectedGender === gender ? 'checked' : ''}
                                                data-gender="${gender}"
                                            />
                                            <label for="gender-${index}">${gender}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Sắp xếp -->
                        <div class="${cx('filter-section')}">
                            <div class="${cx('filter-section-header')}" data-section="sort">
                                <h4>Sắp xếp</h4>
                                <i class="fas fa-chevron-down ${expandedSections.sort ? cx('rotate') : ''}"></i>
                            </div>
                            <div class="${cx('filter-section-content', {'collapsed': !expandedSections.sort})}">
                                <select class="${cx('sort-select')}" id="sort-select">
                                    <option value="default" ${sortOption === 'default' ? 'selected' : ''}>Mặc định</option>
                                    <option value="price-asc" ${sortOption === 'price-asc' ? 'selected' : ''}>Giá: Thấp đến cao</option>
                                    <option value="price-desc" ${sortOption === 'price-desc' ? 'selected' : ''}>Giá: Cao đến thấp</option>
                                    <option value="name-asc" ${sortOption === 'name-asc' ? 'selected' : ''}>Tên: A-Z</option>
                                    <option value="name-desc" ${sortOption === 'name-desc' ? 'selected' : ''}>Tên: Z-A</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="${cx('filter-box-footer')}">
                        <button class="${cx('clear-filter')}" id="clear-filter-btn">
                            Xóa bộ lọc
                        </button>
                        <button class="${cx('apply-filter')}" id="apply-filter-btn">
                            Áp dụng & Đóng
                        </button>
                    </div>
                `;
                
                // Thêm vào body
                document.body.appendChild(filterBox);
                
                // Lưu reference
                filterBoxRef.current = filterBox;
                
                // Thêm sự kiện đóng filter
                const closeBtn = filterBox.querySelector(`.${cx('close-filter-btn')}`);
                if (closeBtn) {
                    closeBtn.addEventListener('click', toggleFiltersMobile);
                }
                
                // Thêm sự kiện cho apply filter
                const applyBtn = filterBox.querySelector('#apply-filter-btn');
                if (applyBtn) {
                    applyBtn.addEventListener('click', () => {
                        // Cập nhật giá
                        const minInput = document.getElementById('price-min');
                        const maxInput = document.getElementById('price-max');
                        if (minInput && maxInput) {
                            setPriceRange({
                                min: parseInt(minInput.value) || 0,
                                max: parseInt(maxInput.value) || 100000000
                            });
                        }
                        
                        // Cập nhật thương hiệu
                        const checkedBrands = Array.from(document.querySelectorAll('input[data-brand]:checked'))
                            .map(input => input.getAttribute('data-brand'));
                        setSelectedBrands(checkedBrands);
                        
                        // Cập nhật giới tính
                        const checkedGender = document.querySelector('input[data-gender]:checked');
                        if (checkedGender) {
                            setSelectedGender(checkedGender.getAttribute('data-gender'));
                        } else {
                            setSelectedGender('');
                        }
                        
                        // Cập nhật sắp xếp
                        const sortSelect = document.getElementById('sort-select');
                        if (sortSelect) {
                            setSortOption(sortSelect.value);
                        }
                        
                        // Cập nhật URL
                        updateUrlParams(
                            checkedBrands.length > 0 ? checkedBrands[0] : null,
                            checkedGender ? checkedGender.getAttribute('data-gender') : ''
                        );
                        
                        // Đóng filter
                        toggleFiltersMobile();
                    });
                }
                
                // Thêm sự kiện cho clear filter
                const clearBtn = filterBox.querySelector('#clear-filter-btn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        // Reset các giá trị trên form
                        const minInput = document.getElementById('price-min');
                        const maxInput = document.getElementById('price-max');
                        if (minInput && maxInput) {
                            minInput.value = 0;
                            maxInput.value = 100000000;
                        }
                        
                        // Bỏ chọn tất cả các thương hiệu
                        document.querySelectorAll('input[data-brand]:checked').forEach(input => {
                            input.checked = false;
                        });
                        
                        // Bỏ chọn giới tính
                        document.querySelectorAll('input[data-gender]:checked').forEach(input => {
                            input.checked = false;
                        });
                        
                        // Reset select box
                        const sortSelect = document.getElementById('sort-select');
                        if (sortSelect) {
                            sortSelect.value = 'default';
                        }
                        
                        // Clear filter
                        clearFilters();
                    });
                }
                
                // Thêm sự kiện cho section headers
                const sectionHeaders = filterBox.querySelectorAll(`.${cx('filter-section-header')}`);
                sectionHeaders.forEach(header => {
                    header.addEventListener('click', () => {
                        const section = header.getAttribute('data-section');
                        if (section) {
                            toggleSection(section);
                            const icon = header.querySelector('i');
                            if (icon) {
                                icon.classList.toggle(cx('rotate'));
                            }
                            const content = header.nextElementSibling;
                            if (content) {
                                content.classList.toggle(cx('collapsed'));
                            }
                        }
                    });
                });
                
                // Thêm sự kiện drag & drop cho filter box
                let isDragging = false;
                let offsetX, offsetY;
                
                const filterHeader = filterBox.querySelector(`.${cx('filter-box-header')}`);
                if (filterHeader) {
                    filterHeader.addEventListener('mousedown', (e) => {
                        isDragging = true;
                        offsetX = e.clientX - filterBox.getBoundingClientRect().left;
                        offsetY = e.clientY - filterBox.getBoundingClientRect().top;
                        filterBox.style.cursor = 'grabbing';
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (isDragging) {
                            const x = e.clientX - offsetX;
                            const y = e.clientY - offsetY;
                            
                            // Giới hạn trong viewport
                            const maxX = window.innerWidth - filterBox.offsetWidth;
                            const maxY = window.innerHeight - filterBox.offsetHeight;
                            
                            filterBox.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
                            filterBox.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
                        }
                    });
                    
                    document.addEventListener('mouseup', () => {
                        isDragging = false;
                        if (filterBox) {
                            filterBox.style.cursor = 'auto';
                        }
                    });
                    
                    // Touch events cho mobile
                    filterHeader.addEventListener('touchstart', (e) => {
                        isDragging = true;
                        offsetX = e.touches[0].clientX - filterBox.getBoundingClientRect().left;
                        offsetY = e.touches[0].clientY - filterBox.getBoundingClientRect().top;
                    });
                    
                    document.addEventListener('touchmove', (e) => {
                        if (isDragging) {
                            const x = e.touches[0].clientX - offsetX;
                            const y = e.touches[0].clientY - offsetY;
                            
                            // Giới hạn trong viewport
                            const maxX = window.innerWidth - filterBox.offsetWidth;
                            const maxY = window.innerHeight - filterBox.offsetHeight;
                            
                            filterBox.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
                            filterBox.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
                        }
                    });
                    
                    document.addEventListener('touchend', () => {
                        isDragging = false;
                    });
                }
            }
        } else {
            // Nếu cần ẩn filter box
            const filterBox = document.getElementById("floating-filter-box");
            if (filterBox) {
                filterBox.remove();
                filterBoxRef.current = null;
            }
        }
    }, [showFiltersMobile, expandedSections, brands, genders, selectedBrands, selectedGender, sortOption, priceRange]);

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
    
    // Cập nhật useEffect xử lý URL thay đổi (sau useEffect hiện tại)
    useEffect(() => {
        // Đặt searchTerm từ URL parameter
        if (searchParam) {
            setSearchTerm(searchParam);
        } else {
            setSearchTerm('');
        }
    }, [searchParam]);
    
    // Cập nhật useEffect lọc sản phẩm để cải thiện tìm kiếm
    useEffect(() => {
        if (products.length === 0) return;
        
        let result = [...products];
        
        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            // Tách từ khóa tìm kiếm thành các từ riêng lẻ
            const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
            
            // Tính điểm độ phù hợp cho mỗi sản phẩm
            result = result.map(product => {
                const productName = product.name ? product.name.toLowerCase() : '';
                const productDesc = product.description ? product.description.toLowerCase() : '';
                
                // Điểm độ phù hợp
                let relevanceScore = 0;
                
                // Tính điểm cho mỗi từ trong từ khóa tìm kiếm
                searchWords.forEach(word => {
                    // Từ có trong tên sản phẩm được ưu tiên cao hơn
                    if (productName.includes(word)) {
                        relevanceScore += 2;
                    } 
                    // Từ có trong mô tả sản phẩm
                    else if (productDesc.includes(word)) {
                        relevanceScore += 1;
                    }
                });
                
                return {
                    ...product,
                    relevanceScore
                };
            });
            
            // Lọc các sản phẩm có điểm > 0 và sắp xếp theo điểm phù hợp
            result = result
                .filter(product => product.relevanceScore > 0)
                .sort((a, b) => b.relevanceScore - a.relevanceScore);
        }
        
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
    }, [products, priceRange, selectedBrands, selectedGender, sortOption, searchTerm]);

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
        
        // Thêm search param nếu có
        if (searchTerm) {
            params.set('search', searchTerm);
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
        setSearchTerm(''); // Xóa từ khóa tìm kiếm
        // Cập nhật URL để xóa các tham số lọc
        navigate('/products', { replace: true });
    };

    // Tạo tiêu đề trang dựa trên các bộ lọc
    const getPageTitle = () => {
        if (searchTerm) {
            return `Kết quả tìm kiếm cho "${searchTerm}"`;
        } else if (selectedGender && selectedGender === 'Nam') {
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
                    {/* Phần hiển thị sản phẩm */}
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
