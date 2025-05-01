const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const nodemailer = require('nodemailer');

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

// Gửi email xác nhận đơn hàng
exports.sendOrderConfirmationEmail = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra quyền: chỉ người dùng đặt hàng hoặc admin mới có thể gửi
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền gửi xác nhận đơn hàng này'
            });
        }

        // Lấy thông tin người dùng để gửi email
        const user = await User.findById(order.user);
        
        if (!user || !user.email) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy email người dùng'
            });
        }
        
        // Cấu hình transporter cho nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        // Format thông tin đơn hàng
        const formattedItems = order.orderItems.map(item => {
            return `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 5px;"></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toLocaleString('vi-VN')} VND</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toLocaleString('vi-VN')} VND</td>
                </tr>
            `;
        }).join('');
        
        // Nội dung email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Xác nhận đơn hàng #${order._id}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #333;">✅ Đơn hàng của bạn đã được xác nhận!</h2>
                        <p style="color: #666;">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.</p>
                        <p style="font-size: 16px;">Mã đơn hàng: <strong style="color: #007bff;">${order._id}</strong></p>
                        <p style="color: #666;">Ngày đặt hàng: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #333; padding-bottom: 10px; border-bottom: 1px solid #eee;">Thông tin giao hàng</h3>
                        <p><strong>Người nhận:</strong> ${order.shippingInfo.fullName}</p>
                        <p><strong>Địa chỉ:</strong> ${order.shippingInfo.address}, ${order.shippingInfo.city}</p>
                        <p><strong>Số điện thoại:</strong> ${order.shippingInfo.phoneNo}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #333; padding-bottom: 10px; border-bottom: 1px solid #eee;">Sản phẩm đã đặt</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Hình ảnh</th>
                                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Sản phẩm</th>
                                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Số lượng</th>
                                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Đơn giá</th>
                                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${formattedItems}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                            <span>Tạm tính:</span>
                            <span>${order.itemsPrice.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                            <span>Thuế:</span>
                            <span>${order.taxPrice.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                            <span>Phí vận chuyển:</span>
                            <span>${order.shippingPrice === 0 ? 'Miễn phí' : order.shippingPrice.toLocaleString('vi-VN') + ' VND'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px; border-top: 1px solid #ddd; font-weight: bold; font-size: 18px;">
                            <span>Tổng cộng:</span>
                            <span>${order.totalPrice.toLocaleString('vi-VN')} VND</span>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #666;">
                        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hỗ trợ.</p>
                        <p>© ${new Date().getFullYear()} Shop. Tất cả các quyền được bảo lưu.</p>
                    </div>
                </div>
            `
        };
        
        // Gửi email
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({
            success: true,
            message: 'Đã gửi email xác nhận đơn hàng thành công'
        });
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi gửi email xác nhận'
        });
    }
}; 