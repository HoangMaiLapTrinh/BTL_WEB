const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Tạm thời để trống, sẽ thêm controller sau
router.route('/users').get(isAuthenticatedUser, authorizeRoles('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        users: []
    });
});

module.exports = router; 