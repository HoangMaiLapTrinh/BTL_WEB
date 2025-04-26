const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        default: 'Khách hàng'
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    lastMessage: {
        type: String,
        default: ''
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userEmail: {
        type: String,
        default: ''
    }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 