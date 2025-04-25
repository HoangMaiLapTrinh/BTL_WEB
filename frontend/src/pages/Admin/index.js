import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './Admin.module.scss';
import { API_URL } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.js';
import { showToast } from '../../components/Toast/index.js';

const cx = classNames.bind(styles);

function Admin() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0
    });
    const [newProduct, setNewProduct] = useState({
        code: '',
        name: '',
        images: [],
        price: 0,
        description: '',
        stock: 10,
        category: '6418b95ee7644b19ba04ff83',
        brand: '',
        xuatXu: '',
        gioiTinh: '',
        mauSac: '',
        kieuDang: '',
        chatLieu: '',
        size: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [priceSort, setPriceSort] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersResponse = await axios.get(`${API_URL}/orders/admin`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (ordersResponse.data.success) {
                setDashboardStats(prev => ({
                    ...prev,
                    totalOrders: ordersResponse.data.orders.length
                }));
                console.log('Orders data:', ordersResponse.data);
            }

            // Fetch products
            const productsResponse = await axios.get(`${API_URL}/products/products`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (productsResponse.data.success) {
                setDashboardStats(prev => ({
                    ...prev,
                    totalProducts: productsResponse.data.products.length
                }));
                console.log('Products data:', productsResponse.data);
            }

            // Fetch users
            const usersResponse = await axios.get(`${API_URL}/users`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (usersResponse.data.success) {
                setDashboardStats(prev => ({
                    ...prev,
                    totalUsers: usersResponse.data.users.length
                }));
                console.log('Users data:', usersResponse.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            showToast({
                title: "Lỗi",
                message: "Không thể tải dữ liệu bảng điều khiển",
                type: "error",
                duration: 3000
            });
        }
    };

    useEffect(() => {
        if (activeTab === 'invoices') {
            axios.get(`${API_URL}/orders/admin`, { withCredentials: true })
                .then(response => {
                    if (response.data.success) {
                        setInvoices(response.data.orders);
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy hóa đơn:', error);
                });
        } else if (activeTab === 'products') {
            axios.get(`${API_URL}/products/products`, { withCredentials: true })
                .then(response => {
                    if (response.data.success) {
                        setProducts(response.data.products);
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy sản phẩm:', error);
                });
        } else if (activeTab === 'dashboard') {
            // Fetch orders count
            axios.get(`${API_URL}/orders/admin`, { withCredentials: true })
                .then(response => {
                    if (response.data.success) {
                        setDashboardStats(prev => ({
                            ...prev,
                            totalOrders: response.data.orders.length
                        }));
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy số lượng hóa đơn:', error);
                });

            // Fetch products count
            axios.get(`${API_URL}/products/products`, { withCredentials: true })
                .then(response => {
                    if (response.data.success) {
                        setDashboardStats(prev => ({
                            ...prev,
                            totalProducts: response.data.products.length
                        }));
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy số lượng sản phẩm:', error);
                });

            // Fetch users count
            axios.get(`${API_URL}/users`, { 
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.data.success) {
                        setDashboardStats(prev => ({
                            ...prev,
                            totalUsers: response.data.users.length
                        }));
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy số lượng người dùng:', error);
                });
        }
    }, [activeTab, token]);

    const handleAddProduct = () => {
        setShowAddForm(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imagePromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({ url: reader.result });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises)
            .then(images => {
                setNewProduct({ ...newProduct, images });
            })
            .catch(error => console.error('Lỗi khi xử lý ảnh:', error));
    };

    const handleSaveProduct = () => {
        // Tạo mã sản phẩm ngẫu nhiên nếu không được nhập
        const randomCode = !newProduct.code || newProduct.code.trim() === '' ? 
            `PROD-${Math.floor(Math.random() * 1000000)}` : newProduct.code;
            
        // Tạo đối tượng sản phẩm phù hợp với schema
        const productData = {
            name: newProduct.name,
            price: newProduct.price,
            description: newProduct.description || `Mô tả sản phẩm ${newProduct.name}`,
            images: newProduct.images || [{ url: 'https://via.placeholder.com/150' }],
            category: newProduct.category || 'Áo sơ mi', // Danh mục mặc định
            stock: newProduct.stock || 10,
            code: randomCode,
            // Các thông tin bổ sung
            brand: newProduct.brand,
            xuatXu: newProduct.xuatXu,
            gioiTinh: newProduct.gioiTinh,
            mauSac: newProduct.mauSac,
            kieuDang: newProduct.kieuDang,
            chatLieu: newProduct.chatLieu,
            size: newProduct.size
        };

        console.log('Gửi dữ liệu sản phẩm:', productData);

        axios.post(`${API_URL}/products/product/new`, productData, { 
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.data.success) {
                setProducts([...products, response.data.product]);
                setShowAddForm(false);
                setNewProduct({
                    code: '',
                    name: '',
                    images: [],
                    price: 0,
                    description: '',
                    stock: 10,
                    category: '',
                    brand: '',
                    xuatXu: '',
                    gioiTinh: '',
                    mauSac: '',
                    kieuDang: '',
                    chatLieu: '',
                    size: ''
                });
                showToast({
                    title: "Thành công",
                    message: "Thêm sản phẩm mới thành công!",
                    type: "success",
                    duration: 3000
                });
            }
        })
        .catch(error => {
            console.error('Lỗi khi thêm sản phẩm:', error);
            if (error.response) {
                console.error('Dữ liệu phản hồi:', error.response.data);
            }
            showToast({
                title: "Lỗi",
                message: "Không thể thêm sản phẩm. Vui lòng thử lại!",
                type: "error",
                duration: 3000
            });
        });
    };

    const handleEditProduct = (productId) => {
        // Logic sửa sản phẩm
        showToast({
            title: "Thông báo",
            message: "Chức năng đang được phát triển",
            type: "info",
            duration: 3000
        });
    };

    const handleDeleteProduct = (productId) => {
        axios.delete(`${API_URL}/products/product/${productId}`, { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    setProducts(products.filter(product => product._id !== productId));
                    showToast({
                        title: "Thành công",
                        message: "Đã xóa sản phẩm thành công!",
                        type: "success",
                        duration: 3000
                    });
                }
            })
            .catch(error => {
                console.error('Lỗi khi xóa sản phẩm:', error);
                showToast({
                    title: "Lỗi",
                    message: "Không thể xóa sản phẩm. Vui lòng thử lại!",
                    type: "error",
                    duration: 3000
                });
            });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Implement search logic
    };

    const handleBrandFilter = (e) => {
        setBrandFilter(e.target.value);
        // Implement brand filter logic
    };

    const handlePriceSort = (e) => {
        setPriceSort(e.target.value);
        // Implement price sort logic
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className={cx('dashboard')}>
                        <h2>Bảng điều khiển</h2>
                        <div className={cx('stats-container')}>
                            <div className={cx('stat-card')}>
                                <h3>Tổng số hóa đơn</h3>
                                <p className={cx('stat-number')}>{dashboardStats.totalOrders}</p>
                            </div>
                            <div className={cx('stat-card')}>
                                <h3>Tổng số tài khoản</h3>
                                <p className={cx('stat-number')}>{dashboardStats.totalUsers}</p>
                            </div>
                            <div className={cx('stat-card')}>
                                <h3>Tổng số sản phẩm</h3>
                                <p className={cx('stat-number')}>{dashboardStats.totalProducts}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'invoices':
                return (
                    <div>
                        <h2>Danh sách hóa đơn</h2>
                        <ul>
                            {invoices.map(invoice => (
                                <li key={invoice._id}>
                                    <p>Mã hóa đơn: {invoice._id}</p>
                                    <p>Tổng tiền: {invoice.totalPrice}</p>
                                    <p>Trạng thái: {invoice.orderStatus}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'products':
                return (
                    <div className={cx('wrapper')}>
                        <div className={cx('product-management')}>
                            {showAddForm ? (
                                <div className={cx('add-product-form')}>
                                    <h3>Thêm sản phẩm mới</h3>
                                    <input
                                        type="text"
                                        placeholder="Tên sản phẩm"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Giá"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Thương hiệu"
                                        value={newProduct.brand}
                                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Xuất xứ"
                                        value={newProduct.xuatXu}
                                        onChange={(e) => setNewProduct({ ...newProduct, xuatXu: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Giới tính"
                                        value={newProduct.gioiTinh}
                                        onChange={(e) => setNewProduct({ ...newProduct, gioiTinh: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Màu sắc"
                                        value={newProduct.mauSac}
                                        onChange={(e) => setNewProduct({ ...newProduct, mauSac: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Kiểu dáng"
                                        value={newProduct.kieuDang}
                                        onChange={(e) => setNewProduct({ ...newProduct, kieuDang: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Chất liệu"
                                        value={newProduct.chatLieu}
                                        onChange={(e) => setNewProduct({ ...newProduct, chatLieu: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Size"
                                        value={newProduct.size}
                                        onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                                    />
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <div className={cx('form-actions')}>
                                        <button onClick={handleSaveProduct}>Lưu</button>
                                        <button onClick={() => setShowAddForm(false)}>Hủy</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={cx('search-bar')}>
                                        <input 
                                            type="text" 
                                            placeholder="Tìm kiếm sản phẩm..." 
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                    </div>

                                    <div className={cx('filter-section')}>
                                        <select value={brandFilter} onChange={handleBrandFilter}>
                                            <option value="">Tất cả thương hiệu</option>
                                            <option value="nike">Nike</option>
                                            <option value="gucci">Gucci</option>
                                            <option value="dior">Dior</option>
                                        </select>

                                        <select value={priceSort} onChange={handlePriceSort}>
                                            <option value="">Sắp xếp theo giá</option>
                                            <option value="asc">Giá tăng dần</option>
                                            <option value="desc">Giá giảm dần</option>
                                        </select>
                                    </div>

                                    <button className={cx('add-product')} onClick={handleAddProduct}>
                                        + Thêm sản phẩm mới
                                    </button>

                                    <div className={cx('product-list')}>
                                        {products.map((product) => (
                                            <div key={product._id} className={cx('product-item')}>
                                                <div className={cx('product-info')}>
                                                    <div className={cx('product-image')}>
                                                        <img 
                                                            src={product.images?.[0]?.url || 'placeholder.jpg'} 
                                                            alt={product.name} 
                                                        />
                                                    </div>
                                                    <div className={cx('product-details')}>
                                                        <div className={cx('product-name')}>{product.name}</div>
                                                        <div className={cx('product-price')}>
                                                            {new Intl.NumberFormat('vi-VN', { 
                                                                style: 'currency', 
                                                                currency: 'VND' 
                                                            }).format(product.price)}
                                                        </div>
                                                        {product.brand && (
                                                            <div className={cx('product-brand')}>{product.brand}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={cx('product-actions')}>
                                                    <button 
                                                        className={cx('action-button', 'edit')}
                                                        onClick={() => handleEditProduct(product._id)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button 
                                                        className={cx('action-button', 'delete')}
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={cx('pagination')}>
                                        <button 
                                            disabled={currentPage === 1} 
                                            onClick={handlePrevPage}
                                        >
                                            &lt;
                                        </button>
                                        <span>{currentPage}</span>
                                        <button onClick={handleNextPage}>
                                            &gt;
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'users':
                return <div>Quản lý người dùng</div>;
            default:
                return <div>Bảng điều khiển</div>;
        }
    };

    return (
        <div className={cx('admin-container')}>
            <div className={cx('sidebar')}>
                <button onClick={() => setActiveTab('dashboard')}>Bảng điều khiển</button>
                <button onClick={() => setActiveTab('invoices')}>Hóa đơn</button>
                <button onClick={() => setActiveTab('products')}>Sản phẩm</button>
                <button onClick={() => setActiveTab('users')}>Người dùng</button>
            </div>
            <div className={cx('content')}>
                {renderContent()}
            </div>
        </div>
    );
}

export default Admin;