const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getMessages, 
  markAsRead, 
  getUnreadCount 
} = require('../controllers/messageController');
const { authenticateToken } = require("../middlewares/auth-middleware");

// Send a new message
router.post('/', sendMessage);

// Get unread message count for the authenticated user
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    // Get all requests where user is involved
    const userRequests = await require('../models/HelpRequest').find({
      $or: [{ requester: userId }, { helper: userId }]
    });
    const requestIds = userRequests.map(req => req._id);
    // Count unread messages
    const unreadCount = await require('../models/Message').countDocuments({
      request: { $in: requestIds },
      sender: { $ne: userId },
      isRead: false
    });
    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark a message as read
router.put('/:messageId/read', markAsRead);

// Get messages for a specific request (must come last)
router.get('/:requestId', getMessages);

module.exports = router; 