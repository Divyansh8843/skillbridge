const emailService = require('../utils/emailService');
const User = require('../models/User');
const Message = require('../models/Message');
const HelpRequest = require('../models/HelpRequest');

exports.sendMessage = async (req, res) => {
  try {
    const { requestId, senderId, content, messageType = 'text' } = req.body;
    
    // Create the message
    const newMessage = new Message({
      request: requestId,
      sender: senderId,
      content,
      messageType,
      isRead: false
    });
    
    const savedMessage = await newMessage.save();
    
    // Get request details to find the recipient
    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Determine recipient (if sender is requester, recipient is helper, and vice versa)
    const recipientId = request.requester.toString() === senderId ? request.helper : request.requester;
    
    if (recipientId) {
      // Get sender and recipient details for email notification
      const [sender, recipient] = await Promise.all([
        User.findById(senderId),
        User.findById(recipientId)
      ]);
      
      // Send email notification to recipient
      if (recipient && recipient.email) {
          await emailService.notifyNewMessage(
          recipient.email,
          recipient.name || recipient.username,
          sender.name || sender.username,
          content,
          requestId
        );
      }
    }
    
    res.status(201).json({ 
      message: 'Message sent successfully',
      message: savedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const messages = await Message.find({ request: requestId })
      .populate('sender', 'name username email picture')
      .sort({ createdAt: 1 });
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId is a valid ObjectId
    if (!userId || userId === 'count' || !require('mongoose').Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Get all requests where user is involved
    const userRequests = await HelpRequest.find({
      $or: [{ requester: userId }, { helper: userId }]
    });
    
    const requestIds = userRequests.map(req => req._id);
    
    // Count unread messages
    const unreadCount = await Message.countDocuments({
      request: { $in: requestIds },
      sender: { $ne: userId },
      isRead: false
    });
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
 