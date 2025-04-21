const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Tạm thời để trống, sẽ thêm controller sau
router.route('/categories').get((req, res) => {
    res.status(200).json({
        success: true,
        categories: []
    });
});

module.exports = router; 