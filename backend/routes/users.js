const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const { getAllUsers, deleteUser, updateUserByAdmin } = require('../controllers/authController');

// Route để lấy tất cả users (chỉ admin)
router.route('/').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);

// Route để xóa user theo ID (chỉ admin)
router.route('/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

// Route để cập nhật thông tin user (chỉ admin)
router.route('/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateUserByAdmin);

module.exports = router; 