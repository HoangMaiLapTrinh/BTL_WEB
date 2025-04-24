const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    logout, 
    getUserProfile,
    updateProfile,
    updatePassword,
    updateSettings
} = require('../controllers/authController');
const { isAuthenticatedUser } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/settings/update').put(isAuthenticatedUser, updateSettings);

module.exports = router; 