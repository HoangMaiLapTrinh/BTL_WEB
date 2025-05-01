const express = require('express');
const router = express.Router();
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    cancelOrder,
    removeOrder,
    resendOrderConfirmationEmail
} = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/orders/me').get(isAuthenticatedUser, myOrders);
router.route('/order/:id/cancel').put(isAuthenticatedUser, cancelOrder);
router.route('/order/:id/resend-email').post(isAuthenticatedUser, resendOrderConfirmationEmail);
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);
router.route('/admin/order/:id/remove').delete(isAuthenticatedUser, authorizeRoles('admin'), removeOrder);

module.exports = router; 