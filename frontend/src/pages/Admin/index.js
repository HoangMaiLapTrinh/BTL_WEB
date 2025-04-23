import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import * as styles from './Admin.module.scss';

const cx = classNames.bind(styles);

function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        code: '',
        name: '',
        img: '',
        price: 0,
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
            axios.get('/api/admin/orders')
                .then(response => {
                    if (response.data.success) {
                        setInvoices(response.data.orders);
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy hóa đơn:', error);
                });
        } else if (activeTab === 'products') {
            axios.get('/api/admin/products')
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
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct({ ...newProduct, img: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = () => {
        axios.post('/api/admin/product/new', newProduct)
            .then(response => {
                if (response.data.success) {
                    setProducts([...products, response.data.product]);
                    setShowAddForm(false);
                    setNewProduct({
                        code: '',
                        name: '',
                        img: '',
                        price: 0,
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
            });
    };

    const handleEditProduct = (productId) => {
        // Logic sửa sản phẩm
    };

    const handleDeleteProduct = (productId) => {
        axios.delete(`/api/admin/product/${productId}`)
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
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                                <input type="number" placeholder="Giá" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
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