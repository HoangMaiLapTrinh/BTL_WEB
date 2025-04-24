const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { isAuthenticatedUser } = require('../middleware/auth');

// Lấy tất cả bình luận của một sản phẩm - Không cần đăng nhập
router.get('/product/:productId', commentController.getProductComments);

// Thêm bình luận mới - Yêu cầu đăng nhập
router.post('/product/:productId', isAuthenticatedUser, commentController.addComment);

// Cập nhật bình luận - Yêu cầu đăng nhập
router.put('/:commentId', isAuthenticatedUser, commentController.updateComment);

// Xóa bình luận - Yêu cầu đăng nhập
router.delete('/:commentId', isAuthenticatedUser, commentController.deleteComment);

module.exports = router; 