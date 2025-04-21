const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true,
        maxLength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        maxLength: [8, 'Giá sản phẩm không được vượt quá 8 chữ số'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm']
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Vui lòng chọn danh mục sản phẩm']
    },
    seller: {
        type: String,
        required: [true, 'Vui lòng nhập người bán']
    },
    stock: {
        type: Number,
        required: [true, 'Vui lòng nhập số lượng tồn kho'],
        maxLength: [5, 'Số lượng tồn kho không được vượt quá 5 chữ số'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema); 