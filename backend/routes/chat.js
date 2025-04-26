const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Tạo hoặc lấy cuộc hội thoại của người dùng
router.get('/conversation', isAuthenticatedUser, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Tìm cuộc hội thoại của người dùng
        let conversation = await Conversation.findOne({ userId });
        
        // Nếu không tìm thấy, tạo mới
        if (!conversation) {
            conversation = new Conversation({
                userId,
                userName: req.user.name || 'Khách hàng',
                userEmail: req.user.email || ''
            });
            await conversation.save();
        }
        
        res.status(200).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Lỗi khi lấy cuộc hội thoại:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy cuộc hội thoại'
        });
    }
});

// Tạo cuộc hội thoại cho khách (không cần đăng nhập)
router.post('/conversation/guest', async (req, res) => {
    try {
        const guestId = req.body.guestId || `guest_${Date.now()}`;
        const guestName = req.body.guestName || 'Khách';
        
        // Tìm cuộc hội thoại của khách
        let conversation = await Conversation.findOne({ userId: guestId });
        
        // Nếu không tìm thấy, tạo mới
        if (!conversation) {
            conversation = new Conversation({
                userId: guestId,
                userName: guestName
            });
            await conversation.save();
        }
        
        res.status(200).json({
            success: true,
            conversation,
            guestId
        });
    } catch (error) {
        console.error('Lỗi khi tạo cuộc hội thoại cho khách:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo cuộc hội thoại'
        });
    }
});

// Gửi tin nhắn
router.post('/message', isAuthenticatedUser, async (req, res) => {
    try {
        const { conversationId, text, isAdmin = false } = req.body;
        
        // Lấy thông tin người dùng từ token
        const userId = req.user._id;
        const userName = req.user.name || 'Người dùng';
        const userRole = req.user.role || [];
        
        console.log('Thông tin người dùng gửi tin nhắn:', { userId, userName, userRole, isAdmin });
        
        // Kiểm tra quyền admin nếu tin nhắn được gửi với tư cách admin
        if (isAdmin && !userRole.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền gửi tin nhắn với tư cách admin'
            });
        }
        
        // Tìm cuộc hội thoại
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            console.log('Không tìm thấy cuộc hội thoại:', conversationId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy cuộc hội thoại'
            });
        }
        
        console.log('Thông tin cuộc hội thoại:', conversation);
        
        // Kiểm tra xem người dùng có quyền gửi tin nhắn trong cuộc hội thoại này không
        if (!isAdmin && conversation.userId.toString() !== userId.toString()) {
            console.log('Người dùng không có quyền gửi tin nhắn trong cuộc hội thoại này');
            return res.status(403).json({
                success: false,
                message: 'Không có quyền gửi tin nhắn trong cuộc hội thoại này'
            });
        }
        
        // Tạo tin nhắn mới
        const message = new Message({
            conversationId,
            senderId: userId,
            senderName: userName,
            text,
            isAdmin
        });
        
        console.log('Tin nhắn sẽ lưu:', message);
        await message.save();
        console.log('Đã lưu tin nhắn thành công');
        
        // Cập nhật thông tin cuộc hội thoại
        conversation.lastMessage = text;
        conversation.lastUpdated = Date.now();
        
        // Nếu tin nhắn từ người dùng, tăng số tin nhắn chưa đọc
        if (!isAdmin) {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }
        
        await conversation.save();
        console.log('Đã cập nhật cuộc hội thoại');
        
        res.status(201).json({
            success: true,
            message: message
        });
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi gửi tin nhắn',
            error: error.message
        });
    }
});

// Lấy danh sách tin nhắn của cuộc hội thoại
router.get('/messages/:conversationId', isAuthenticatedUser, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role || [];
        
        console.log('Lấy tin nhắn cho cuộc hội thoại:', conversationId);
        console.log('Thông tin người dùng:', { userId, userRole });
        
        // Tìm cuộc hội thoại
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            console.log('Không tìm thấy cuộc hội thoại:', conversationId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy cuộc hội thoại'
            });
        }
        
        // Kiểm tra quyền truy cập tin nhắn
        const isAdmin = userRole.includes('admin');
        if (!isAdmin && conversation.userId.toString() !== userId.toString()) {
            console.log('Người dùng không có quyền xem tin nhắn trong cuộc hội thoại này');
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xem tin nhắn trong cuộc hội thoại này'
            });
        }
        
        // Lấy danh sách tin nhắn, sắp xếp theo thời gian tạo
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });
        
        console.log(`Tìm thấy ${messages.length} tin nhắn`);
        
        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tin nhắn:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách tin nhắn',
            error: error.message
        });
    }
});

// Lấy danh sách cuộc hội thoại cho admin
router.get('/conversations', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
    try {
        // Lấy danh sách cuộc hội thoại, sắp xếp theo thời gian cập nhật mới nhất
        const conversations = await Conversation.find()
            .sort({ lastUpdated: -1 });
        
        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách cuộc hội thoại:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách cuộc hội thoại'
        });
    }
});

// Đánh dấu tin nhắn đã đọc
router.put('/conversation/:conversationId/read', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // Cập nhật cuộc hội thoại
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy cuộc hội thoại'
            });
        }
        
        conversation.unreadCount = 0;
        await conversation.save();
        
        // Đánh dấu tất cả tin nhắn của người dùng là đã đọc
        await Message.updateMany(
            { conversationId, isAdmin: false, isRead: false },
            { isRead: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Đánh dấu tin nhắn đã đọc thành công'
        });
    } catch (error) {
        console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đánh dấu tin nhắn đã đọc'
        });
    }
});

// Xóa cuộc hội thoại và tất cả tin nhắn liên quan
router.delete('/conversation/:conversationId', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // Kiểm tra xem cuộc hội thoại có tồn tại không
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy cuộc hội thoại'
            });
        }
        
        // Xóa tất cả tin nhắn thuộc cuộc hội thoại này
        await Message.deleteMany({ conversationId });
        
        // Xóa cuộc hội thoại
        await Conversation.findByIdAndDelete(conversationId);
        
        res.status(200).json({
            success: true,
            message: 'Đã xóa cuộc hội thoại và tin nhắn liên quan thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa cuộc hội thoại:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa cuộc hội thoại',
            error: error.message
        });
    }
});

module.exports = router; 