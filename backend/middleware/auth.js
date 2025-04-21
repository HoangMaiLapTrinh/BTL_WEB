const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kiểm tra xem người dùng đã đăng nhập chưa
exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để truy cập tài nguyên này'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }
};

// Xử lý quyền người dùng
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tài nguyên này'
            });
        }
        next();
    };
}; 