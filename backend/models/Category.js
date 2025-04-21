const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên danh mục'],
        trim: true,
        maxLength: [50, 'Tên danh mục không được vượt quá 50 ký tự']
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả danh mục']
    },
    image: {
        type: String,
        required: [true, 'Vui lòng thêm ảnh danh mục']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', categorySchema); 