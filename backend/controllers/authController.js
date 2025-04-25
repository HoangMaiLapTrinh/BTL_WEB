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

        // Cập nhật số điện thoại nếu có
        if (req.body.phoneNumber) {
            newUserData.phoneNumber = req.body.phoneNumber;
        }

        // Cập nhật địa chỉ nếu có
        if (req.body.address && Array.isArray(req.body.address)) {
            newUserData.address = req.body.address;
        }

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

// Cập nhật mật khẩu người dùng
exports.updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới không khớp'
            });
        }

        // Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        // Lấy thông tin người dùng cùng với mật khẩu
        const user = await User.findById(req.user.id).select('+password');

        // Kiểm tra mật khẩu cũ
        const isPasswordMatched = await user.comparePassword(oldPassword);

        if (!isPasswordMatched) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác'
            });
        }

        // Đặt mật khẩu mới và lưu
        user.password = newPassword;
        await user.save();

        // Tạo token mới sau khi đổi mật khẩu
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
                message: 'Đổi mật khẩu thành công',
                token
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật thiết lập của người dùng
exports.updateSettings = async (req, res) => {
    try {
        const { notificationSettings, privacySettings, languagePreference, themePreference } = req.body;
        
        const updateData = {};
        
        // Cập nhật thiết lập thông báo nếu có
        if (notificationSettings) {
            updateData.notificationSettings = notificationSettings;
        }
        
        // Cập nhật thiết lập quyền riêng tư nếu có
        if (privacySettings) {
            updateData.privacySettings = privacySettings;
        }
        
        // Cập nhật ngôn ngữ nếu có
        if (languagePreference) {
            updateData.languagePreference = languagePreference;
        }
        
        // Cập nhật giao diện nếu có
        if (themePreference) {
            updateData.themePreference = themePreference;
        }
        
        // Nếu không có dữ liệu để cập nhật, trả về lỗi
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu để cập nhật'
            });
        }
        
        // Cập nhật người dùng trong cơ sở dữ liệu
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Cập nhật thiết lập thành công',
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

// Hàm lấy tất cả users (chỉ admin mới được phép)
exports.getAllUsers = async (req, res) => {
    try {
        // Chỉ admin mới có quyền xem tất cả users
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }

        const users = await User.find().select('-password');
        
        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách users:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách người dùng'
        });
    }
};

// Hàm xóa user theo ID (chỉ admin mới được phép)
exports.deleteUser = async (req, res) => {
    try {
        // Chỉ admin mới có quyền xóa user
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này'
            });
        }

        const userId = req.params.id;
        
        // Kiểm tra nếu user cần xóa tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép admin xóa chính mình
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể xóa tài khoản của chính mình'
            });
        }

        await User.findByIdAndDelete(userId);
        
        return res.status(200).json({
            success: true,
            message: 'Người dùng đã được xóa thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa user:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa người dùng'
        });
    }
};

// Hàm cập nhật thông tin user (chỉ admin mới được phép)
exports.updateUserByAdmin = async (req, res) => {
    try {
        // Chỉ admin mới có quyền cập nhật user
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này'
            });
        }

        const userId = req.params.id;
        const { name, email, role } = req.body;
        
        // Kiểm tra nếu user cần cập nhật tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Cập nhật thông tin
        const updatedData = {
            name: name || user.name,
            email: email || user.email,
            role: role || user.role
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true, runValidators: true }
        ).select('-password');
        
        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: 'Cập nhật thông tin người dùng thành công'
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật user:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật thông tin người dùng'
        });
    }
}; 