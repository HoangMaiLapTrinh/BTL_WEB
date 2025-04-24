const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    getProductDetails,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsByCategory
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Danh sách sản phẩm
router.route('/products').get(getProducts);

// Lấy sản phẩm theo danh mục
router.route('/category/:categoryId').get(getProductsByCategory);

// Thêm sản phẩm mới
router.route('/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);

// Chi tiết, cập nhật, xóa sản phẩm
router.route('/product/:id')
    .get(getProductDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

// Đánh giá sản phẩm
router.route('/review').put(isAuthenticatedUser, createProductReview);

module.exports = router; 