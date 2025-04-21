const Product = require('../models/Product');

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        req.body.seller = req.user.id;
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy tất cả sản phẩm
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy chi tiết sản phẩm
exports.getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        await product.remove();

        res.status(200).json({
            success: true,
            message: 'Sản phẩm đã được xóa'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Tạo/Cập nhật đánh giá
exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        const product = await Product.findById(productId);

        const isReviewed = product.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach(review => {
                if (review.user.toString() === req.user._id.toString()) {
                    review.comment = comment;
                    review.rating = rating;
                }
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        product.ratings =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save({ validateBeforeSave: false });

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