const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên'],
        maxLength: [30, 'Tên không được vượt quá 30 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minLength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        select: false
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    address: [{
        street: String,
        city: String,
        country: String,
        zipCode: String
    }],
    phoneNumber: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// So sánh mật khẩu
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo JWT token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', userSchema); 