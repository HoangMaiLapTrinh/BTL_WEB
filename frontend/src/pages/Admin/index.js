import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './Admin.module.scss';
import { API_URL } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.js';

const cx = classNames.bind(styles);

function Admin() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
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
        }
    }, [activeTab]);

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
            }
        })
        .catch(error => {
            console.error('Lỗi khi thêm sản phẩm:', error);
            if (error.response) {
                console.error('Dữ liệu phản hồi:', error.response.data);
            }
        });
    };

    const handleEditProduct = (productId) => {
        // Logic sửa sản phẩm
    };

    const handleDeleteProduct = (productId) => {
        axios.delete(`${API_URL}/products/product/${productId}`, { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    setProducts(products.filter(product => product._id !== productId));
                }
            })
            .catch(error => {
                console.error('Lỗi khi xóa sản phẩm:', error);
            });
    };

    const renderContent = () => {
        switch (activeTab) {
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
                    <div>
                        <h2>Quản lý sản phẩm</h2>
                        <div className={cx('product-actions')}>
                            <button onClick={handleAddProduct}>Thêm sản phẩm</button>
                        </div>
                        {showAddForm && (
                            <div className={cx('add-product-form')}>
                                <h3>Thêm sản phẩm mới</h3>
                                <input type="text" placeholder="Mã sản phẩm" value={newProduct.code} onChange={(e) => setNewProduct({...newProduct, code: e.target.value})} />
                                <input type="text" placeholder="Tên sản phẩm" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                                <textarea placeholder="Mô tả sản phẩm" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                                <input type="number" placeholder="Giá" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                                <input type="number" placeholder="Số lượng" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                                <input type="text" placeholder="Danh mục" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
                                <input type="text" placeholder="Thương hiệu" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} />
                                <input type="text" placeholder="Xuất xứ" value={newProduct.xuatXu} onChange={(e) => setNewProduct({...newProduct, xuatXu: e.target.value})} />
                                <input type="text" placeholder="Giới tính" value={newProduct.gioiTinh} onChange={(e) => setNewProduct({...newProduct, gioiTinh: e.target.value})} />
                                <input type="text" placeholder="Màu sắc" value={newProduct.mauSac} onChange={(e) => setNewProduct({...newProduct, mauSac: e.target.value})} />
                                <input type="text" placeholder="Kiểu dáng" value={newProduct.kieuDang} onChange={(e) => setNewProduct({...newProduct, kieuDang: e.target.value})} />
                                <input type="text" placeholder="Chất liệu" value={newProduct.chatLieu} onChange={(e) => setNewProduct({...newProduct, chatLieu: e.target.value})} />
                                <input type="text" placeholder="Size" value={newProduct.size} onChange={(e) => setNewProduct({...newProduct, size: e.target.value})} />
                                <button onClick={handleSaveProduct}>Lưu sản phẩm</button>
                            </div>
                        )}
                        <ul>
                            {products.map(product => (
                                <li key={product._id}>
                                    <p>Tên sản phẩm: {product.name}</p>
                                    <p>Giá: {product.price}</p>
                                    <button onClick={() => handleEditProduct(product._id)}>Sửa</button>
                                    <button onClick={() => handleDeleteProduct(product._id)}>Xóa</button>
                                </li>
                            ))}
                        </ul>
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