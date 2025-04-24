const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { 
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    createOrderFromCart
} = require('../controllers/cartController');

// Route lấy giỏ hàng của người dùng
router.get('/', isAuthenticatedUser, getCart);

// Route thêm sản phẩm vào giỏ hàng
router.post('/add', isAuthenticatedUser, addToCart);

// Route cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update', isAuthenticatedUser, updateCartItem);

// Route xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:itemId', isAuthenticatedUser, removeFromCart);

// Route xóa toàn bộ giỏ hàng
router.delete('/clear', isAuthenticatedUser, clearCart);

// Route tạo đơn hàng từ giỏ hàng
router.post('/checkout', isAuthenticatedUser, createOrderFromCart);

module.exports = router; 