const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        fullName: {
            type: String,
            required: [true, 'Vui lòng nhập họ tên người nhận']
        },
        address: {
            type: String,
            required: [true, 'Vui lòng nhập địa chỉ giao hàng']
        },
        city: {
            type: String,
            required: [true, 'Vui lòng nhập thành phố/tỉnh']
        },
        phoneNo: {
            type: String,
            required: [true, 'Vui lòng nhập số điện thoại']
        },
        postalCode: {
            type: String,
            default: ''
        },
        country: {
            type: String,
            default: 'Việt Nam'
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    paymentInfo: {
        id: {
            type: String
        },
        status: {
            type: String,
            default: 'Chưa thanh toán'
        },
        method: {
            type: String,
            enum: ['COD', 'Banking', 'Momo', 'ZaloPay', 'VNPay', 'Credit Card'],
            default: 'COD'
        }
    },
    paidAt: {
        type: Date
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    note: {
        type: String,
        default: ''
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['Processing', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    deliveredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema); 