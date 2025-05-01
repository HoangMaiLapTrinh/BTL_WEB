const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// Tạo đơn hàng mới
exports.newOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body;

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user._id
        });

        // Lấy thông tin email của người dùng
        const user = await User.findById(req.user._id);
        
        // Gửi email xác nhận đơn hàng nếu có email
        if (user && user.email) {
            try {
                await sendOrderConfirmationEmail(order, user.email);
            } catch (emailError) {
                console.error('Lỗi khi gửi email xác nhận:', emailError);
                // Không ảnh hưởng đến quy trình tạo đơn hàng nếu gửi email thất bại
            }
        }

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy chi tiết đơn hàng
exports.getSingleOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy tất cả đơn hàng của người dùng đăng nhập
exports.myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy tất cả đơn hàng (ADMIN)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        let totalAmount = 0;
        orders.forEach(order => {
            totalAmount += order.totalPrice;
        });

        res.status(200).json({
            success: true,
            totalAmount,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật trạng thái đơn hàng (ADMIN)
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng này đã được giao'
            });
        }

        order.orderItems.forEach(async item => {
            await updateStock(item.product, item.quantity);
        });

        order.orderStatus = req.body.status;
        
        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Gửi lại email xác nhận đơn hàng
exports.resendOrderConfirmationEmail = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        // Kiểm tra quyền truy cập: chỉ admin hoặc chính người đặt hàng mới có thể gửi lại email
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện thao tác này'
            });
        }
        
        // Lấy thông tin email của người dùng
        const user = await User.findById(order.user);
        
        if (!user || !user.email) {
            return res.status(400).json({
                success: false,
                message: 'Không thể tìm thấy email của người dùng'
            });
        }

        // Kiểm tra xem các biến môi trường cần thiết đã được cấu hình chưa
        if (!process.env.EMAIL) {
            return res.status(500).json({
                success: false,
                message: 'Chức năng gửi email chưa được cấu hình. Vui lòng liên hệ admin.'
            });
        }
        
        // Gửi email xác nhận
        const emailSent = await sendOrderConfirmationEmail(order, user.email);
        
        if (emailSent) {
            res.status(200).json({
                success: true,
                message: 'Email xác nhận đơn hàng đã được gửi thành công'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Không thể gửi email xác nhận. Vui lòng kiểm tra cấu hình email hoặc thử lại sau.'
            });
        }
    } catch (error) {
        console.error('Lỗi resendOrderConfirmationEmail:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi gửi email xác nhận'
        });
    }
};

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false });
}

// Xóa đơn hàng (ADMIN)
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        await order.remove();

        res.status(200).json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Người dùng hủy đơn hàng
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy đơn hàng này'
            });
        }
        
        // Kiểm tra xem đơn hàng có thể hủy không (chỉ có thể hủy khi trạng thái là Processing)
        if (order.orderStatus !== 'Processing') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng này vì đã được xử lý'
            });
        }

        // Cập nhật trạng thái đơn hàng thành Cancelled
        order.orderStatus = 'Cancelled';

        // Cập nhật lại số lượng sản phẩm trong kho
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                // Trả lại số lượng sản phẩm vào kho
                product.stock += item.quantity;
                await product.save({ validateBeforeSave: false });
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Đơn hàng đã được hủy thành công và số lượng sản phẩm đã được cập nhật lại trong kho'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa đơn hàng hoàn toàn (ADMIN)
exports.removeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        // Nếu đơn hàng không phải đã bị hủy, cập nhật lại số lượng sản phẩm trong kho
        if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered') {
            // Cập nhật lại số lượng sản phẩm trong kho
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    // Trả lại số lượng sản phẩm vào kho
                    product.stock += item.quantity;
                    await product.save({ validateBeforeSave: false });
                }
            }
        }

        // Xóa hoàn toàn đơn hàng khỏi database
        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Đơn hàng đã được xóa hoàn toàn'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 