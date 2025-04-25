import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './Admin.module.scss';
import { API_URL } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.js';
import { showToast } from '../../components/Toast/index.js';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faFileInvoice, faUsers, faSignOutAlt, faSearch, faPlus, faEye, faPencilAlt, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Admin() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        recentOrders: []
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
    const [genderFilter, setGenderFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // State cho quản lý hóa đơn
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
    const [invoiceSort, setInvoiceSort] = useState('date-desc');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    
    // State cho quản lý người dùng
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        address: ''
    });

    // Thêm vào phần khai báo state
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersResponse = await axios.get(`${API_URL}/orders/admin/orders`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (ordersResponse.data.success) {
                setDashboardStats(prev => ({
                    ...prev,
                    totalOrders: ordersResponse.data.orders.length,
                    recentOrders: ordersResponse.data.orders.slice(0, 5)
                }));
                console.log('Orders data:', ordersResponse.data);
                setInvoices(ordersResponse.data.orders);
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
                setProducts(productsResponse.data.products);
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
                setUsers(usersResponse.data.users);
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
        // Kiểm tra quyền admin khi component mount
        if (!user) {
            showToast({
                title: "Quyền truy cập bị từ chối",
                message: "Bạn cần đăng nhập để truy cập trang Admin",
                type: "error",
                duration: 3000
            });
            navigate('/login?adminRequired=true');
            return;
        }

        if (user.role !== 'admin') {
            showToast({
                title: "Quyền truy cập bị từ chối",
                message: "Bạn không có quyền truy cập trang Admin",
                type: "error",
                duration: 3000
            });
            navigate('/login?adminRequired=true');
            return;
        }

        // Nếu có quyền admin, hiển thị thông báo chào mừng
        showToast({
            title: "Xin chào Admin",
            message: `Chào mừng ${user.name} đến với trang quản trị`,
            type: "success",
            duration: 3000
        });
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'invoices') {
            fetchInvoices();
        } else if (activeTab === 'products') {
            fetchProducts();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'dashboard') {
            fetchDashboardData();
        }
    }, [activeTab, token]);

    // Hàm lấy danh sách hóa đơn
    const fetchInvoices = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders/admin/orders`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
                    if (response.data.success) {
                        setInvoices(response.data.orders);
                setFilteredInvoices(response.data.orders);
            } else {
                showToast({
                    title: "Lỗi",
                    message: "Không thể tải danh sách hóa đơn",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
                    console.error('Lỗi khi lấy hóa đơn:', error);
            showToast({
                title: "Lỗi",
                message: "Không thể tải danh sách hóa đơn",
                type: "error",
                duration: 3000
                });
        }
    };

    // Hàm lấy danh sách sản phẩm
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products/products`, {
                withCredentials: true
            });
            
                    if (response.data.success) {
                        setProducts(response.data.products);
                setFilteredProducts(response.data.products);
            } else {
                showToast({
                    title: "Lỗi",
                    message: "Không thể tải danh sách sản phẩm",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
                    console.error('Lỗi khi lấy sản phẩm:', error);
            showToast({
                title: "Lỗi",
                message: "Không thể tải danh sách sản phẩm",
                type: "error",
                duration: 3000
            });
                    }
    };
    
    // Hàm lấy danh sách người dùng
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
                    if (response.data.success) {
                setUsers(response.data.users);
                setFilteredUsers(response.data.users);
            } else {
                showToast({
                    title: "Lỗi",
                    message: "Không thể tải danh sách người dùng",
                    type: "error",
                    duration: 3000
                });
                    }
        } catch (error) {
            console.error('Lỗi khi lấy người dùng:', error);
            showToast({
                title: "Lỗi",
                message: "Không thể tải danh sách người dùng",
                type: "error",
                duration: 3000
            });
        }
    };

    // Cập nhật khi sản phẩm thay đổi hoặc bộ lọc thay đổi
    useEffect(() => {
        if (activeTab === 'products') {
            filterProducts();
        }
    }, [products, searchTerm, brandFilter, priceSort, genderFilter, activeTab]);

    // Hàm lọc sản phẩm
    const filterProducts = () => {
        let filtered = [...products];
        
        // Lọc theo từ khóa tìm kiếm
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product => 
                (product.name && product.name.toLowerCase().includes(term)) ||
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.brand && product.brand.toLowerCase().includes(term))
            );
        }
        
        // Lọc theo thương hiệu
        if (brandFilter) {
            filtered = filtered.filter(product => 
                product.brand && product.brand.toLowerCase() === brandFilter.toLowerCase()
            );
        }
        
        // Lọc theo giới tính
        if (genderFilter) {
            filtered = filtered.filter(product => 
                product.gioiTinh && product.gioiTinh.toLowerCase() === genderFilter.toLowerCase()
            );
        }
        
        // Sắp xếp
        if (priceSort === 'asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (priceSort === 'desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (priceSort === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (priceSort === 'name-desc') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }
        
        setFilteredProducts(filtered);
    };

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
                if (showEditForm) {
                    setEditingProduct({ ...editingProduct, images });
                } else {
                    setNewProduct({ ...newProduct, images });
                }
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

    const handleEditProduct = async (productId) => {
        try {
            // Fetch chi tiết sản phẩm từ API
            const response = await axios.get(`${API_URL}/products/product/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                const product = response.data.product;
                // Cập nhật state với thông tin sản phẩm đang chỉnh sửa
                setEditingProduct({
                    _id: product._id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    brand: product.brand,
                    category: product.category,
                    gioiTinh: product.gioiTinh,
                    mauSac: product.mauSac,
                    kieuDang: product.kieuDang,
                    chatLieu: product.chatLieu,
                    xuatXu: product.xuatXu,
                    size: product.size,
                    images: product.images || []
                });
                setShowEditForm(true);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin sản phẩm:', error);
            showToast({
                title: "Lỗi",
                message: "Không thể lấy thông tin sản phẩm. Vui lòng thử lại!",
                type: "error",
                duration: 3000
            });
        }
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
        setCurrentPage(1);
    };

    const handleBrandFilter = (e) => {
        setBrandFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePriceSort = (e) => {
        setPriceSort(e.target.value);
    };
    
    const handleGenderFilter = (e) => {
        setGenderFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
    };
    
    // Xử lý phân trang
    const getProductsForCurrentPage = () => {
        const pageSize = 8; // 8 sản phẩm mỗi trang
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        return filteredProducts.slice(startIdx, endIdx);
    };
    
    // Tính tổng số trang
    const getTotalPages = () => {
        const pageSize = 8;
        return Math.ceil(filteredProducts.length / pageSize);
    };
    
    // Hiển thị thông báo khi không có sản phẩm
    const renderNoProductsMessage = () => {
        if (searchTerm || brandFilter || genderFilter) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '50px 0', 
                    color: '#666' 
                }}>
                    <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '15px', color: '#ccc' }}></i>
                    <p>Không tìm thấy sản phẩm phù hợp với bộ lọc</p>
                    <button 
                        onClick={clearFilters}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            backgroundColor: '#5c6bc0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            );
        }
        
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '50px 0', 
                color: '#666' 
            }}>
                <i className="fas fa-box-open" style={{ fontSize: '48px', marginBottom: '15px', color: '#ccc' }}></i>
                <p>Chưa có sản phẩm nào</p>
                <button 
                    onClick={handleAddProduct}
                    style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        backgroundColor: '#5c6bc0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Thêm sản phẩm mới
                </button>
            </div>
        );
    };
    
    const clearFilters = () => {
        setSearchTerm('');
        setBrandFilter('');
        setPriceSort('');
        setGenderFilter('');
        setCurrentPage(1);
    };

    // Hàm tìm kiếm và lọc hóa đơn
    useEffect(() => {
        if (invoices.length === 0) return;
        
        let result = [...invoices];
        
        // Lọc theo từ khóa tìm kiếm
        if (invoiceSearchTerm.trim()) {
            const term = invoiceSearchTerm.toLowerCase();
            result = result.filter(invoice => 
                (invoice._id && invoice._id.toLowerCase().includes(term)) ||
                (invoice.user && invoice.user.name && invoice.user.name.toLowerCase().includes(term)) ||
                (invoice.user && invoice.user.email && invoice.user.email.toLowerCase().includes(term))
            );
        }
        
        // Lọc theo trạng thái
        if (invoiceStatusFilter) {
            result = result.filter(invoice => 
                invoice.orderStatus && invoice.orderStatus.toLowerCase() === invoiceStatusFilter.toLowerCase()
            );
        }
        
        // Sắp xếp
        if (invoiceSort === 'date-desc') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (invoiceSort === 'date-asc') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (invoiceSort === 'price-desc') {
            result.sort((a, b) => b.totalPrice - a.totalPrice);
        } else if (invoiceSort === 'price-asc') {
            result.sort((a, b) => a.totalPrice - b.totalPrice);
        }
        
        setFilteredInvoices(result);
    }, [invoices, invoiceSearchTerm, invoiceStatusFilter, invoiceSort]);
    
    // Hàm tìm kiếm người dùng
    useEffect(() => {
        if (users.length === 0) return;
        
        let result = [...users];
        
        // Lọc theo từ khóa tìm kiếm
        if (userSearchTerm.trim()) {
            const term = userSearchTerm.toLowerCase();
            result = result.filter(user => 
                (user.name && user.name.toLowerCase().includes(term)) ||
                (user.email && user.email.toLowerCase().includes(term)) ||
                (user.phone && user.phone.includes(term))
            );
        }
        
        setFilteredUsers(result);
    }, [users, userSearchTerm]);
    
    // Xử lý hủy đơn hàng
    const handleCancelOrder = async (orderId) => {
        try {
            const response = await axios.put(
                `${API_URL}/orders/order/${orderId}/cancel`,
                { 
                    status: 'Cancelled',
                    cancelledBy: 'admin',
                    cancelledByUserName: user.name,
                    cancelledAt: new Date().toISOString()
                },
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data.success) {
                // Cập nhật danh sách hóa đơn
                const updatedInvoices = invoices.map(invoice => {
                    if (invoice._id === orderId) {
                        return { ...invoice, orderStatus: 'Cancelled' };
                    }
                    return invoice;
                });
                
                setInvoices(updatedInvoices);
                
                // Cập nhật danh sách đơn hàng gần đây trên dashboard
                const updatedRecentOrders = dashboardStats.recentOrders.map(order => {
                    if (order._id === orderId) {
                        return { ...order, orderStatus: 'Cancelled' };
                    }
                    return order;
                });
                
                setDashboardStats({
                    ...dashboardStats,
                    recentOrders: updatedRecentOrders
                });
                
                // Đóng modal nếu đang xem chi tiết hóa đơn bị hủy
                if (selectedInvoice && selectedInvoice._id === orderId) {
                    setSelectedInvoice({ ...selectedInvoice, orderStatus: 'Cancelled' });
                }
                
                showToast({
                    title: "Thành công",
                    message: "Đã hủy đơn hàng thành công",
                    type: "success",
                    duration: 3000
                });
            } else {
                showToast({
                    title: "Lỗi",
                    message: response.data.message || "Không thể hủy đơn hàng",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            showToast({
                title: "Lỗi",
                message: error.response?.data?.message || "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
                type: "error",
                duration: 3000
            });
        }
    };
    
    // Xử lý xem chi tiết hóa đơn
    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowInvoiceModal(true);
    };
    
    // Xử lý thêm người dùng mới
    const handleAddUser = () => {
        setNewUser({
            name: '',
            email: '',
            password: '',
            role: 'user',
            phone: '',
            address: ''
        });
        setIsEditingUser(false);
        setShowUserModal(true);
    };
    
    // Xử lý chỉnh sửa người dùng
    const handleEditUser = (userData) => {
        setNewUser({
            _id: userData._id,
            name: userData.name || '',
            email: userData.email || '',
            password: '',
            role: userData.role || 'user',
            phone: userData.phone || '',
            address: userData.address || ''
        });
        setIsEditingUser(true);
        setShowUserModal(true);
    };
    
    // Xử lý xóa người dùng
    const handleDeleteUser = async (userId) => {
        try {
            const response = await axios.delete(`${API_URL}/users/${userId}`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                // Cập nhật danh sách người dùng
                const updatedUsers = users.filter(user => user._id !== userId);
                setUsers(updatedUsers);
                
                showToast({
                    title: "Thành công",
                    message: "Đã xóa người dùng thành công",
                    type: "success",
                    duration: 3000
                });
            } else {
                showToast({
                    title: "Lỗi",
                    message: "Không thể xóa người dùng",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            showToast({
                title: "Lỗi",
                message: error.response?.data?.message || "Không thể xóa người dùng",
                type: "error",
                duration: 3000
            });
        }
    };
    
    // Xử lý lưu thông tin người dùng
    const handleSaveUser = async () => {
        try {
            let response;
            
            // Kiểm tra dữ liệu
            if (!newUser.name || !newUser.email) {
                showToast({
                    title: "Lỗi",
                    message: "Vui lòng nhập tên và email",
                    type: "error",
                    duration: 3000
                });
                return;
            }
            
            if (isEditingUser) {
                // Cập nhật người dùng hiện có
                const userData = { ...newUser };
                if (!userData.password) {
                    delete userData.password; // Không gửi mật khẩu nếu không thay đổi
                }
                
                response = await axios.put(
                    `${API_URL}/users/${newUser._id}`,
                    userData,
                    {
                        withCredentials: true,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            } else {
                // Tạo người dùng mới
                if (!newUser.password) {
                    showToast({
                        title: "Lỗi",
                        message: "Vui lòng nhập mật khẩu",
                        type: "error",
                        duration: 3000
                    });
                    return;
                }
                
                response = await axios.post(
                    `${API_URL}/users/register`,
                    newUser,
                    {
                        withCredentials: true,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            }
            
            if (response.data.success) {
                // Cập nhật danh sách người dùng
                fetchUsers();
                
                // Đóng modal
                setShowUserModal(false);
                
                showToast({
                    title: "Thành công",
                    message: isEditingUser ? "Đã cập nhật người dùng" : "Đã thêm người dùng mới",
                    type: "success",
                    duration: 3000
                });
            } else {
                showToast({
                    title: "Lỗi",
                    message: response.data.message || "Không thể lưu thông tin người dùng",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Lỗi khi lưu thông tin người dùng:', error);
            showToast({
                title: "Lỗi",
                message: error.response?.data?.message || "Không thể lưu thông tin người dùng",
                type: "error",
                duration: 3000
            });
        }
    };

    // Hàm hỗ trợ định dạng tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Hàm hỗ trợ định dạng ngày
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Hàm chuyển đổi trạng thái đơn hàng sang tiếng Việt
    const getStatusVietnamese = (status) => {
        switch (status) {
            case 'Processing': return 'Đang xử lý';
            case 'Shipped': return 'Đang giao';
            case 'Delivered': return 'Đã giao';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    // Thêm hàm xử lý xóa đơn hàng
    const handleRemoveOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hoàn toàn đơn hàng này? Hành động này không thể hoàn tác.')) {
            return;
        }
        
        try {
            const response = await axios.delete(
                `${API_URL}/orders/admin/order/${orderId}/remove`,
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data.success) {
                // Cập nhật danh sách hóa đơn
                const updatedInvoices = invoices.filter(invoice => invoice._id !== orderId);
                setInvoices(updatedInvoices);
                
                // Cập nhật danh sách đơn hàng gần đây trên dashboard
                const updatedRecentOrders = dashboardStats.recentOrders.filter(order => order._id !== orderId);
                
                setDashboardStats({
                    ...dashboardStats,
                    recentOrders: updatedRecentOrders
                });
                
                // Đóng modal nếu đang xem chi tiết hóa đơn bị xóa
                if (selectedInvoice && selectedInvoice._id === orderId) {
                    setSelectedInvoice(null);
                    setShowInvoiceModal(false);
                }
                
                showToast({
                    title: "Thành công",
                    message: "Đã xóa đơn hàng thành công",
                    type: "success",
                    duration: 3000
                });
            } else {
                showToast({
                    title: "Lỗi",
                    message: response.data.message || "Không thể xóa đơn hàng",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Lỗi khi xóa đơn hàng:', error);
            showToast({
                title: "Lỗi",
                message: error.response?.data?.message || "Không thể xóa đơn hàng. Vui lòng thử lại sau.",
                type: "error",
                duration: 3000
            });
        }
    };

    // Thêm hàm này sau hàm handleEditProduct
    const handleUpdateProduct = async () => {
        if (!editingProduct.name || !editingProduct.price) {
            showToast({
                title: "Lỗi",
                message: "Vui lòng nhập tên và giá sản phẩm",
                type: "error",
                duration: 3000
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', editingProduct.name);
            formData.append('price', editingProduct.price);
            formData.append('description', editingProduct.description || '');
            formData.append('stock', editingProduct.stock || 10);
            formData.append('brand', editingProduct.brand || '');
            formData.append('category', editingProduct.category || '');
            formData.append('gioiTinh', editingProduct.gioiTinh || '');
            formData.append('mauSac', editingProduct.mauSac || '');
            formData.append('kieuDang', editingProduct.kieuDang || '');
            formData.append('chatLieu', editingProduct.chatLieu || '');
            formData.append('xuatXu', editingProduct.xuatXu || '');
            formData.append('size', editingProduct.size || '');

            // Nếu có hình ảnh mới
            if (productImages.length > 0) {
                productImages.forEach(file => {
                    formData.append('images', file);
                });
            }

            const response = await axios.put(
                `${API_URL}/products/product/${editingProduct._id}`,
                editingProduct,
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Cập nhật danh sách sản phẩm
                const updatedProducts = products.map(product => {
                    if (product._id === editingProduct._id) {
                        return response.data.product;
                    }
                    return product;
                });
                
                setProducts(updatedProducts);
                setShowEditForm(false);
                setEditingProduct(null);
                setProductImages([]);
                
                showToast({
                    title: "Thành công",
                    message: "Cập nhật sản phẩm thành công!",
                    type: "success",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            showToast({
                title: "Lỗi",
                message: error.response?.data?.message || "Không thể cập nhật sản phẩm. Vui lòng thử lại!",
                type: "error",
                duration: 3000
            });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className={cx('dashboard-content')}>
                        <div className={cx('stats-container')}>
                            <div className={cx('stat-box')}>
                                <div className={cx('stat-icon')}>
                                    <i className="fas fa-shopping-bag"></i>
                            </div>
                                <div className={cx('stat-info')}>
                                    <div className={cx('stat-number')}>{dashboardStats.totalOrders}</div>
                                    <div className={cx('stat-label')}>Tổng đơn hàng</div>
                            </div>
                            </div>
                            <div className={cx('stat-box')}>
                                <div className={cx('stat-icon')}>
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className={cx('stat-info')}>
                                    <div className={cx('stat-number')}>{dashboardStats.totalUsers}</div>
                                    <div className={cx('stat-label')}>Người dùng</div>
                                </div>
                            </div>
                            <div className={cx('stat-box')}>
                                <div className={cx('stat-icon')}>
                                    <i className="fas fa-box"></i>
                                </div>
                                <div className={cx('stat-info')}>
                                    <div className={cx('stat-number')}>{dashboardStats.totalProducts}</div>
                                    <div className={cx('stat-label')}>Sản phẩm</div>
                                </div>
                            </div>
                            <div className={cx('stat-box')}>
                                <div className={cx('stat-icon')}>
                                    <i className="fas fa-dollar-sign"></i>
                                </div>
                                <div className={cx('stat-info')}>
                                    <div className={cx('stat-number')}>{formatCurrency(dashboardStats.recentOrders.reduce((total, order) => total + order.totalPrice, 0))}</div>
                                    <div className={cx('stat-label')}>Doanh thu</div>
                                </div>
                            </div>
                        </div>

                        <div className={cx('recent-orders')}>
                            <h3>Đơn hàng gần đây</h3>
                            <table className={cx('orders-table')}>
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Thời gian</th>
                                        <th>Tổng tiền</th>
                                        <th>Phương thức TT</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardStats.recentOrders.map((order) => (
                                        <tr key={order._id}>
                                            <td>#{order._id.slice(-6)}</td>
                                            <td>{order.shippingInfo?.fullName || 'Không có tên'}</td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>{formatCurrency(order.totalPrice)}</td>
                                            <td>{order.paymentMethod === "Banking" ? "Chuyển khoản" : "Tiền mặt (COD)"}</td>
                                            <td>
                                                <span
                                                    className={cx('status', {
                                                        'pending': order.orderStatus === 'Pending',
                                                        'processing': order.orderStatus === 'Processing',
                                                        'shipped': order.orderStatus === 'Shipped',
                                                        'delivered': order.orderStatus === 'Delivered',
                                                        'cancelled': order.orderStatus === 'Cancelled'
                                                    })}
                                                >
                                                    {getStatusVietnamese(order.orderStatus)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={cx('action-buttons')}>
                                                    <button 
                                                        className={cx('view-btn')}
                                                        onClick={() => handleViewInvoice(order)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                                                        <button 
                                                            className={cx('cancel-btn')}
                                                            onClick={() => handleCancelOrder(order._id)}
                                                            title="Hủy đơn hàng"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    )}
                                                    <button 
                                                        className={cx('delete-btn')}
                                                        onClick={() => handleRemoveOrder(order._id)}
                                                        title="Xóa đơn hàng"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'invoices':
                return (
                    <div className={cx('invoice-management')}>
                        <h2>Quản lý đơn hàng</h2>
                        
                        <div className={cx('invoice-filters')}>
                            <div className={cx('invoice-search')}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
                                    value={invoiceSearchTerm}
                                    onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                                />
                                <button><i className="fas fa-search"></i></button>
                            </div>
                            
                            <div className={cx('filter-group')}>
                                <select 
                                    value={invoiceStatusFilter} 
                                    onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">Tất cả trạng thái</option>
                                    <option value="PENDING">Chờ xác nhận</option>
                                    <option value="PROCESSING">Đang xử lý</option>
                                    <option value="SHIPPED">Đang giao</option>
                                    <option value="DELIVERED">Đã giao</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className={cx('invoice-table-container')}>
                            <table className={cx('invoice-table')}>
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Thời gian</th>
                                        <th>Tổng tiền</th>
                                        <th>Phương thức TT</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id}>
                                            <td>#{invoice._id.slice(-6)}</td>
                                            <td>{invoice.shippingInfo?.fullName || 'Không có tên'}</td>
                                            <td>{formatDate(invoice.createdAt)}</td>
                                            <td>{formatCurrency(invoice.totalPrice)}</td>
                                            <td>{invoice.paymentMethod === "Banking" ? "Chuyển khoản" : "Tiền mặt (COD)"}</td>
                                            <td>
                                                <span
                                                    className={cx('status', {
                                                        'pending': invoice.orderStatus === 'Pending',
                                                        'processing': invoice.orderStatus === 'Processing',
                                                        'shipped': invoice.orderStatus === 'Shipped',
                                                        'delivered': invoice.orderStatus === 'Delivered',
                                                        'cancelled': invoice.orderStatus === 'Cancelled'
                                                    })}
                                                >
                                                    {getStatusVietnamese(invoice.orderStatus)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={cx('action-buttons')}>
                                                    <button 
                                                        className={cx('view-btn')}
                                                        onClick={() => handleViewInvoice(invoice)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    {invoice.orderStatus !== 'Delivered' && invoice.orderStatus !== 'Cancelled' && (
                                                        <button 
                                                            className={cx('cancel-btn')}
                                                            onClick={() => handleCancelOrder(invoice._id)}
                                                            title="Hủy đơn hàng"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    )}
                                                    <button 
                                                        className={cx('delete-btn')}
                                                        onClick={() => handleRemoveOrder(invoice._id)}
                                                        title="Xóa đơn hàng"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Modal chi tiết hóa đơn */}
                        {showInvoiceModal && selectedInvoice && (
                            <div className={cx('invoice-details-modal')}>
                                <div className={cx('modal-content')}>
                                    <div className={cx('modal-header')}>
                                        <h3>Chi tiết đơn hàng #{selectedInvoice._id.slice(-6)}</h3>
                                        <button 
                                            className={cx('close-btn')}
                                            onClick={() => setShowInvoiceModal(false)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                    
                                    <div className={cx('modal-body')}>
                                        <div className={cx('customer-info')}>
                                            <h4>Thông tin khách hàng</h4>
                                            <p><strong>Họ tên:</strong> {selectedInvoice.shippingInfo?.fullName}</p>
                                            <p><strong>Email:</strong> {selectedInvoice.user?.email}</p>
                                            <p><strong>Điện thoại:</strong> {selectedInvoice.shippingInfo?.phoneNo}</p>
                                            <p><strong>Địa chỉ:</strong> {selectedInvoice.shippingInfo?.address}, {selectedInvoice.shippingInfo?.city}</p>
                                            <p><strong>Phương thức thanh toán:</strong> {selectedInvoice.paymentMethod === "Banking" ? "Chuyển khoản ngân hàng" : "Thanh toán khi nhận hàng (COD)"}</p>
                                        </div>
                                        
                                        <div className={cx('order-details')}>
                                            <h4>Chi tiết sản phẩm</h4>
                                            <table className={cx('order-items-table')}>
                                                <thead>
                                                    <tr>
                                                        <th>Sản phẩm</th>
                                                        <th>Giá</th>
                                                        <th>Số lượng</th>
                                                        <th>Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedInvoice.orderItems.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <div className={cx('product-info')}>
                                                                    <img 
                                                                        src={item.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                                                                        alt={item.name} 
                                                                    />
                                                                    <span>{item.name}</span>
                                                                </div>
                                                            </td>
                                                            <td>{formatCurrency(item.price)}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>{formatCurrency(item.price * item.quantity)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            
                                            <div className={cx('order-summary')}>
                                                <div className={cx('summary-row')}>
                                                    <span>Tổng tiền hàng:</span>
                                                    <span>{formatCurrency(selectedInvoice.itemsPrice)}</span>
                                                </div>
                                                <div className={cx('summary-row')}>
                                                    <span>Phí giao hàng:</span>
                                                    <span>{formatCurrency(selectedInvoice.shippingPrice)}</span>
                                                </div>
                                                <div className={cx('summary-row')}>
                                                    <span>Thuế:</span>
                                                    <span>{formatCurrency(selectedInvoice.taxPrice)}</span>
                                                </div>
                                                <div className={`${cx('summary-row')} ${cx('total')}`}>
                                                    <span>Tổng thanh toán:</span>
                                                    <span>{formatCurrency(selectedInvoice.totalPrice)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={cx('modal-footer')}>
                                        {selectedInvoice && selectedInvoice.orderStatus !== 'Delivered' && selectedInvoice.orderStatus !== 'Cancelled' && (
                                            <button 
                                                className={cx('cancel-order-btn')}
                                                onClick={() => handleCancelOrder(selectedInvoice._id)}
                                            >
                                                Hủy đơn hàng
                                            </button>
                                        )}
                                        <button 
                                            className={cx('delete-order-btn')}
                                            onClick={() => {
                                                handleRemoveOrder(selectedInvoice._id);
                                                setShowInvoiceModal(false);
                                            }}
                                        >
                                            Xóa đơn hàng
                                        </button>
                                        <button 
                                            className={cx('close-modal-btn')}
                                            onClick={() => setShowInvoiceModal(false)}
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'users':
                return (
                    <div className={cx('users-management')}>
                        <h2>Quản lý người dùng</h2>
                        
                        <div className={cx('users-actions')}>
                            <div className={cx('user-search')}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm người dùng..."
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                />
                                <button><i className="fas fa-search"></i></button>
                            </div>
                            
                            <button 
                                className={cx('add-user-btn')}
                                onClick={handleAddUser}
                            >
                                <i className="fas fa-plus"></i> Thêm người dùng
                            </button>
                        </div>
                        
                        <div className={cx('users-table-container')}>
                            <table className={cx('users-table')}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Họ tên</th>
                                        <th>Email</th>
                                        <th>Vai trò</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>#{user._id.slice(-6)}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={cx('role', {
                                                    'admin': user.role === 'admin',
                                                    'user': user.role === 'user'
                                                })}>
                                                    {user.role === 'admin' ? 'Admin' : 'Người dùng'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={cx('action-buttons')}>
                                                    <button 
                                                        className={cx('edit-btn')}
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    {user.role !== 'admin' && (
                                                        <button 
                                                            className={cx('delete-btn')}
                                                            onClick={() => handleDeleteUser(user._id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Modal thêm/chỉnh sửa người dùng */}
                        {showUserModal && (
                            <div className={cx('user-modal')}>
                                <div className={cx('modal-content')}>
                                    <div className={cx('modal-header')}>
                                        <h3>{selectedUser ? "Cập nhật người dùng" : "Thêm người dùng mới"}</h3>
                                        <button 
                                            className={cx('close-btn')}
                                            onClick={() => setShowUserModal(false)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                    
                                    <div className={cx('modal-body')}>
                                        <div className={cx('form-group')}>
                                            <label>Họ tên</label>
                                            <input
                                                type="text"
                                                placeholder="Nhập họ tên"
                                                value={newUser.name}
                                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div className={cx('form-group')}>
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                placeholder="Nhập email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                            />
                                        </div>
                                        
                                        {!selectedUser && (
                                            <div className={cx('form-group')}>
                                                <label>Mật khẩu</label>
                                                <input
                                                    type="password"
                                                    placeholder="Nhập mật khẩu"
                                                    value={newUser.password}
                                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className={cx('form-group')}>
                                            <label>Vai trò</label>
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                            >
                                                <option value="USER">Người dùng</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className={cx('modal-footer')}>
                                        <button 
                                            className={cx('save-btn')}
                                            onClick={handleSaveUser}
                                        >
                                            {selectedUser ? "Cập nhật" : "Tạo mới"}
                                        </button>
                                        <button 
                                            className={cx('cancel-btn')}
                                            onClick={() => setShowUserModal(false)}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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

                                    <div className={cx('filter-controls')}>
                                        <div className={cx('filter-group')}>
                                            <label>Thương hiệu</label>
                                        <select value={brandFilter} onChange={handleBrandFilter}>
                                            <option value="">Tất cả thương hiệu</option>
                                            <option value="nike">Nike</option>
                                            <option value="gucci">Gucci</option>
                                            <option value="dior">Dior</option>
                                                <option value="prada">Prada</option>
                                                <option value="balenciaga">Balenciaga</option>
                                                <option value="adidas">Adidas</option>
                                                <option value="louis vuitton">Louis Vuitton</option>
                                        </select>
                                        </div>

                                        <div className={cx('filter-group')}>
                                            <label>Sắp xếp theo</label>
                                        <select value={priceSort} onChange={handlePriceSort}>
                                                <option value="">Mặc định</option>
                                            <option value="asc">Giá tăng dần</option>
                                            <option value="desc">Giá giảm dần</option>
                                                <option value="name-asc">Tên: A-Z</option>
                                                <option value="name-desc">Tên: Z-A</option>
                                        </select>
                                    </div>

                                        <div className={cx('filter-group')}>
                                            <label>Giới tính</label>
                                            <select value={genderFilter} onChange={handleGenderFilter}>
                                                <option value="">Tất cả</option>
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Unisex">Unisex</option>
                                            </select>
                                                    </div>
                                        
                                        <div className={cx('filter-group')}>
                                            <label>&nbsp;</label>
                                                    <button 
                                                onClick={clearFilters}
                                                style={{
                                                    padding: '8px 15px',
                                                    backgroundColor: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <i className="fas fa-times-circle" style={{ marginRight: '8px' }}></i>
                                                Xóa bộ lọc
                                                    </button>
                                                    </div>
                                                        </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
                                                    <button 
                                            className={cx('add-product-btn')} 
                                            onClick={handleAddProduct}
                                                    >
                                            <i className="fas fa-plus-circle"></i>
                                            Thêm sản phẩm mới
                                                    </button>
                                        
                                        <div style={{ fontWeight: '500', color: '#666' }}>
                                            Hiển thị {filteredProducts.length} sản phẩm
                                                </div>
                                    </div>

                                    {filteredProducts.length > 0 && (
                                        <div className={cx('pagination')}>
                                            <button 
                                                onClick={handlePrevPage} 
                                                disabled={currentPage === 1}
                                                className={cx('pagination-btn')}
                                            >
                                                <i className="fas fa-chevron-left"></i> Trang trước
                                            </button>
                                            <span className={cx('pagination-info')}>
                                                Trang {currentPage} / {getTotalPages()}
                                            </span>
                                            <button 
                                                onClick={handleNextPage}
                                                disabled={currentPage >= getTotalPages()}
                                                className={cx('pagination-btn')}
                                            >
                                                Trang sau <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}

                                    {filteredProducts.length > 0 ? (
                                        <>
                                            <div className={cx('products-grid')}>
                                                {getProductsForCurrentPage().map((product) => (
                                                    <div key={product._id} className={cx('product-item')}>
                                                        <div className={cx('product-action-buttons')}>
                                                            <button 
                                                                className={cx('edit-btn')}
                                                                onClick={() => handleEditProduct(product._id)}
                                                                title="Chỉnh sửa sản phẩm"
                                                            >
                                                                <i className="fas fa-pencil-alt"></i>
                                                            </button>
                                                            <button 
                                                                className={cx('delete-btn')}
                                                                onClick={() => handleDeleteProduct(product._id)}
                                                                title="Xóa sản phẩm"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                        
                                                        <div className={cx('product-image')}>
                                                            <img 
                                                                src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'} 
                                                                alt={product.name} 
                                                            />
                                                        </div>
                                                        
                                                        <div className={cx('product-info')}>
                                                            <h3 className={cx('product-name')}>{product.name}</h3>
                                                            <p className={cx('product-price')}>
                                                                {formatCurrency(product.price)}
                                                            </p>
                                                            {product.brand && (
                                                                <div className={cx('product-brand')}>
                                                                    <i className="fas fa-tag" style={{ marginRight: '5px' }}></i>
                                                                    {product.brand}
                                                                </div>
                                                            )}
                                                            <div className={cx('product-meta')}>
                                                                <span>
                                                                    <i className="fas fa-box" style={{ marginRight: '5px' }}></i>
                                                                    Tồn kho: {product.stock || 0}
                                                                </span>
                                                                {product.gioiTinh && (
                                                                    <span>
                                                                        <i className="fas fa-user" style={{ marginRight: '5px' }}></i>
                                                                        {product.gioiTinh}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className={cx('pagination')}>
                                                <button 
                                                    onClick={handlePrevPage} 
                                                    disabled={currentPage === 1}
                                                    className={cx('pagination-btn')}
                                                >
                                                    <i className="fas fa-chevron-left"></i> Trang trước
                                                </button>
                                                <span className={cx('pagination-info')}>
                                                    Trang {currentPage} / {getTotalPages()}
                                                </span>
                                                <button 
                                                    onClick={handleNextPage}
                                                    disabled={currentPage >= getTotalPages()}
                                                    className={cx('pagination-btn')}
                                                >
                                                    Trang sau <i className="fas fa-chevron-right"></i>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        renderNoProductsMessage()
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            default:
                return <p>Chọn một mục từ menu bên trái</p>;
        }
    };

    return (
        <div className={cx('admin-container')}>
            <div className={cx('sidebar')}>
                <ul className={cx('sidebar-menu')}>
                    <li className={cx('sidebar-item')}>
                        <div 
                            className={cx('sidebar-link', { active: activeTab === 'dashboard' })}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <i className="fas fa-tachometer-alt"></i>
                            Bảng điều khiển
                        </div>
                    </li>
                    <li className={cx('sidebar-item')}>
                        <div 
                            className={cx('sidebar-link', { active: activeTab === 'invoices' })}
                            onClick={() => setActiveTab('invoices')}
                        >
                            <i className="fas fa-file-invoice"></i>
                            Hóa đơn
                        </div>
                    </li>
                    <li className={cx('sidebar-item')}>
                        <div 
                            className={cx('sidebar-link', { active: activeTab === 'products' })}
                            onClick={() => setActiveTab('products')}
                        >
                            <i className="fas fa-box-open"></i>
                            Sản phẩm
                        </div>
                    </li>
                    <li className={cx('sidebar-item')}>
                        <div 
                            className={cx('sidebar-link', { active: activeTab === 'users' })}
                            onClick={() => setActiveTab('users')}
                        >
                            <i className="fas fa-users"></i>
                            Người dùng
                        </div>
                    </li>
                    <li className={cx('sidebar-item')}>
                        <div 
                            className={cx('sidebar-link')}
                            onClick={() => navigate('/')}
                        >
                            <i className="fas fa-home"></i>
                            Về trang chủ
                        </div>
                    </li>
                </ul>
            </div>
            <div className={cx('content')}>
                {renderContent()}
            </div>
            {/* Modal chỉnh sửa sản phẩm */}
            {showEditForm && editingProduct && (
                <div className={cx('product-edit-modal')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h3>Chỉnh sửa sản phẩm</h3>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => {
                                    setShowEditForm(false);
                                    setEditingProduct(null);
                                    setProductImages([]);
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className={cx('modal-body')}>
                            <div className={cx('form-group')}>
                                <label>Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                    placeholder="Nhập tên sản phẩm"
                                />
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Mô tả</label>
                                <textarea
                                    value={editingProduct.description || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                                    placeholder="Nhập mô tả sản phẩm"
                                    rows={4}
                                />
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Giá (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                                        placeholder="Nhập giá sản phẩm"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Số lượng</label>
                                    <input
                                        type="number"
                                        value={editingProduct.stock || 1}
                                        onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                                        placeholder="Nhập số lượng"
                                    />
                                </div>
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Thương hiệu</label>
                                    <input
                                        type="text"
                                        value={editingProduct.brand || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                                        placeholder="Nhập thương hiệu"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Loại sản phẩm</label>
                                    <select
                                        value={editingProduct.category || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                                    >
                                        <option value="">Chọn loại sản phẩm</option>
                                        <option value="shirt">Áo</option>
                                        <option value="pants">Quần</option>
                                        <option value="shoes">Giày</option>
                                        <option value="accessories">Phụ kiện</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Giới tính</label>
                                    <select
                                        value={editingProduct.gioiTinh || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, gioiTinh: e.target.value})}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Màu sắc</label>
                                    <input
                                        type="text"
                                        value={editingProduct.mauSac || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, mauSac: e.target.value})}
                                        placeholder="Nhập màu sắc"
                                    />
                                </div>
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Kiểu dáng</label>
                                    <input
                                        type="text"
                                        value={editingProduct.kieuDang || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, kieuDang: e.target.value})}
                                        placeholder="Nhập kiểu dáng"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Chất liệu</label>
                                    <input
                                        type="text"
                                        value={editingProduct.chatLieu || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, chatLieu: e.target.value})}
                                        placeholder="Nhập chất liệu"
                                    />
                                </div>
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Xuất xứ</label>
                                    <input
                                        type="text"
                                        value={editingProduct.xuatXu || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, xuatXu: e.target.value})}
                                        placeholder="Nhập xuất xứ"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Size</label>
                                    <input
                                        type="text"
                                        value={editingProduct.size || ''}
                                        onChange={(e) => setEditingProduct({...editingProduct, size: e.target.value})}
                                        placeholder="Nhập size"
                                    />
                                </div>
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Hình ảnh hiện tại</label>
                                <div className={cx('current-images')}>
                                    {editingProduct.images && editingProduct.images.length > 0 ? (
                                        editingProduct.images.map((image, index) => (
                                            <div key={index} className={cx('image-item')}>
                                                <img src={image.url} alt={`Sản phẩm ${index + 1}`} />
                                            </div>
                                        ))
                                    ) : (
                                        <p>Không có hình ảnh</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Thêm hình ảnh mới</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                                <small>Có thể chọn nhiều hình ảnh. Nếu thêm hình ảnh mới, các hình ảnh cũ sẽ bị thay thế.</small>
                            </div>
                        </div>
                        
                        <div className={cx('modal-footer')}>
                            <button 
                                className={cx('save-btn')}
                                onClick={handleUpdateProduct}
                            >
                                Cập nhật sản phẩm
                            </button>
                            <button 
                                className={cx('cancel-btn')}
                                onClick={() => {
                                    setShowEditForm(false);
                                    setEditingProduct(null);
                                    setProductImages([]);
                                }}
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;