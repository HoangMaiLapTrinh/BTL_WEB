const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Lấy giỏ hàng của người dùng hiện tại
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: 'items.product',
                select: 'name images price stock'
            });

        if (!cart) {
            // Nếu giỏ hàng không tồn tại, tạo giỏ hàng mới
            cart = await Cart.create({
                user: req.user.id,
                items: [],
                totalAmount: 0
            });
            
            // Populate để format đúng response
            cart = await Cart.findById(cart._id).populate({
                path: 'items.product',
                select: 'name images price stock'
            });
        }

        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy giỏ hàng',
            error: error.message
        });
    }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Kiểm tra số lượng sản phẩm còn đủ trong kho
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng sản phẩm trong kho không đủ'
            });
        }

        // Tìm hoặc tạo giỏ hàng cho người dùng
        let cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            // Nếu chưa có giỏ hàng, tạo mới
            cart = await Cart.create({
                user: req.user.id,
                items: [{
                    product: productId,
                    quantity,
                    price: product.price
                }]
            });
        } else {
            // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex !== -1) {
                // Nếu sản phẩm đã tồn tại, cập nhật số lượng
                cart.items[existingItemIndex].quantity += quantity;
                
                // Kiểm tra nếu số lượng vượt quá tồn kho
                if (cart.items[existingItemIndex].quantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: 'Số lượng sản phẩm trong kho không đủ'
                    });
                }
            } else {
                // Nếu sản phẩm chưa tồn tại, thêm vào giỏ hàng
                cart.items.push({
                    product: productId,
                    quantity,
                    price: product.price
                });
            }

            // Lưu các thay đổi
            await cart.save();
        }

        // Lấy giỏ hàng đã cập nhật và populate thông tin sản phẩm
        cart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name images price stock'
        });

        res.status(200).json({
            success: true,
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            cart
        });
    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm sản phẩm vào giỏ hàng',
            error: error.message
        });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giỏ hàng'
            });
        }
        
        // Tìm item trong giỏ hàng
        const cartItem = cart.items.id(itemId);
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng'
            });
        }
        
        // Kiểm tra số lượng tồn kho
        const product = await Product.findById(cartItem.product);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng sản phẩm trong kho không đủ'
            });
        }
        
        // Cập nhật số lượng
        cartItem.quantity = quantity;
        
        // Lưu thay đổi
        await cart.save();
        
        // Lấy giỏ hàng đã cập nhật
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name images price stock'
        });
        
        res.status(200).json({
            success: true,
            message: 'Đã cập nhật giỏ hàng',
            cart: updatedCart
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật giỏ hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật giỏ hàng',
            error: error.message
        });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giỏ hàng'
            });
        }
        
        // Tìm và xóa sản phẩm
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng'
            });
        }
        
        // Xóa sản phẩm khỏi mảng items
        cart.items.splice(itemIndex, 1);
        
        // Lưu thay đổi
        await cart.save();
        
        // Lấy giỏ hàng đã cập nhật
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name images price stock'
        });
        
        res.status(200).json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
            cart: updatedCart
        });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng',
            error: error.message
        });
    }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giỏ hàng'
            });
        }
        
        // Xóa toàn bộ sản phẩm trong giỏ hàng
        cart.items = [];
        
        // Lưu thay đổi
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Đã xóa toàn bộ giỏ hàng',
            cart
        });
    } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa giỏ hàng',
            error: error.message
        });
    }
};

// Tạo đơn hàng từ giỏ hàng
exports.createOrderFromCart = async (req, res) => {
    try {
        // Lấy thông tin người dùng
        const userId = req.user.id;
        
        // Lấy thông tin giỏ hàng
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name images price stock'
        });
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống không thể tạo đơn hàng'
            });
        }
        
        // Lấy thông tin giao hàng từ request
        const { 
            fullName,
            address, 
            city, 
            postalCode, 
            country, 
            phoneNo,
            paymentMethod,
            note
        } = req.body;
        
        // Kiểm tra thông tin giao hàng có đầy đủ không
        if (!fullName || !address || !city || !phoneNo) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng'
            });
        }
        
        // Tạo mảng orderItems từ items trong giỏ hàng
        const orderItems = cart.items.map(item => {
            return {
                name: item.product.name,
                quantity: item.quantity,
                image: item.product.images[0]?.url || '',
                price: item.price,
                product: item.product._id
            };
        });
        
        // Tính toán giá trị đơn hàng
        const itemsPrice = cart.totalAmount;
        const shippingPrice = 0; // Miễn phí vận chuyển
        const taxPrice = Math.round(itemsPrice * 0.1); // Thuế 10%
        const totalPrice = itemsPrice + shippingPrice + taxPrice;
        
        // Tạo đơn hàng mới
        const Order = require('../models/Order');
        const order = await Order.create({
            shippingInfo: {
                fullName,
                address,
                city,
                phoneNo,
                postalCode: postalCode || '',
                country: country || 'Việt Nam'
            },
            user: userId,
            orderItems,
            paymentInfo: {
                id: `COD_${Date.now()}`, // Mã đơn hàng
                status: 'Chưa thanh toán', // Trạng thái thanh toán
                method: paymentMethod || 'COD' // Phương thức thanh toán
            },
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            note: note || '',
            orderStatus: 'Processing',
            paidAt: paymentMethod === 'COD' ? null : Date.now()
        });
        
        // Cập nhật lại số lượng tồn kho của sản phẩm
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            product.stock -= item.quantity;
            await product.save({ validateBeforeSave: false });
        }
        
        // Xóa giỏ hàng sau khi đặt hàng thành công
        cart.items = [];
        await cart.save();
        
        // Trả về kết quả
        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            order
        });
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng',
            error: error.message
        });
    }
}; 