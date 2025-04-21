const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    logout, 
    getUserProfile,
    updateProfile
} = require('../controllers/authController');
const { isAuthenticatedUser } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

module.exports = router; 