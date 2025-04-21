const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    getProductDetails,
    updateProduct,
    deleteProduct,
    createProductReview
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.route('/products').get(getProducts);
router.route('/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);
router.route('/product/:id')
    .get(getProductDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/review').put(isAuthenticatedUser, createProductReview);

module.exports = router; 