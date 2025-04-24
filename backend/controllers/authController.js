const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Đăng ký người dùng
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        const token = user.getJwtToken();

        // Thiết lập cookie
        const options = {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.status(201)
            .cookie('token', token, options)
            .json({
                success: true,
                token,
                user
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const token = user.getJwtToken();

        // Thiết lập cookie
        const options = {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.status(200)
            .cookie('token', token, options)
            .json({
                success: true,
                token,
                user
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy thông tin người dùng hiện tại
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật thông tin người dùng
exports.updateProfile = async (req, res) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Đăng xuất
exports.logout = async (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công'
    });
}; 