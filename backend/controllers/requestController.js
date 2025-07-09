const emailService = require('../utils/emailService');
const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');

exports.createRequest = async (req, res) => {
  try {
    const { title, description, category, userId } = req.body;

    // Validate required fields
    if (!title || !description || !category || !userId) {
      return res.status(400).json({ error: 'Missing required fields: title, description, category, or userId' });
    }
    // Validate ObjectIds
    if (!require('mongoose').Types.ObjectId.isValid(category)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    if (!require('mongoose').Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    // Check if category exists
    const Category = require('../models/Category');
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ error: 'Category not found' });
    }
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Create the help request
    const newRequest = new HelpRequest({
      title,
      description,
      category,
      requester: userId,
      status: 'open'
    });
    const savedRequest = await newRequest.save();
    // Send email notification
    if (user.email) {
      await emailService.notifyRequestSent(
        user.email,
        user.name || user.username,
        {
          title,
          description,
          category,
          requestId: savedRequest._id
        }
      );
    }
    res.status(201).json({ 
      message: 'Help request created successfully',
      request: savedRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message || 'Failed to create help request' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    // Support filtering by status from query params
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'open';
    }
    const requests = await HelpRequest.find(filter)
      .populate('requester', 'name username email')
      .populate('helper', 'name username email')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    console.log('--- Accept Request API called ---');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    const { requestId } = req.params;
    let { helperId } = req.body;
    console.log('Raw helperId:', helperId, 'Type:', typeof helperId);

    // Ensure helperId is a valid ObjectId
    const mongoose = require('mongoose');
    if (!helperId || !mongoose.Types.ObjectId.isValid(helperId)) {
      console.log('Invalid or missing helperId:', helperId);
      return res.status(400).json({ error: 'Invalid or missing helperId' });
    }
    helperId = mongoose.Types.ObjectId(helperId);

    const request = await HelpRequest.findById(requestId);
    console.log('Found request:', request);
    if (!request) {
      console.log('Request not found');
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'open') {
      console.log('Request is not open. Current status:', request.status);
      return res.status(400).json({ error: 'Request is no longer available' });
    }
    
    // Update request status
    request.helper = helperId;
    request.status = 'in_progress';
    request.acceptedAt = new Date();
    
    const updatedRequest = await request.save();
    console.log('Updated request:', updatedRequest);
    
    // Get user  request  for email notifications
    const [requester, helper] = await Promise.all([
      User.findById(request.requester),
      User.findById(helperId)
    ]);
    
    // Send email notification to requester
    if (requester && requester.email) {
      await emailService.notifyRequestAccepted(
        requester.email,
        requester.name || requester.username,
        helper.name || helper.username,
        helper.email,
        {
          title: request.title,
          description: request.description,
          requestId: request._id
        }
      );
    }
    
    res.json({ 
      message: 'Request accepted successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating } = req.body;
    
    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'in_progress') {
      return res.status(400).json({ error: 'Request must be in progress to complete' });
    }
    
    // Update request status
    request.status = 'completed';
    request.completedAt = new Date();
    if (rating) {
      request.rating = rating;
    }
    
    const updatedRequest = await request.save();
    
    // Get user details for email notification
    const requester = await User.findById(request.requester);
    const helper = await User.findById(request.helper);
    
    // Send email notification to requester
    if (requester && requester.email) {
      await emailService.notifyRequestCompleted(
        requester.email,
        requester.name || requester.username,
        helper.name || helper.username,
        {
          title: request.title,
          description: request.description,
          requestId: request._id
        },
        rating
      );
    }
    
    res.json({ 
      message: 'Request completed successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error completing request:', error);
    res.status(500).json({ error: 'Failed to complete request' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const requests = await HelpRequest.find({
      $or: [{ requester: userId }, { helper: userId }]
    })
    .populate('requester', 'name username email')
    .populate('helper', 'name username email')
    .sort({ createdAt: -1 });
    
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: 'Failed to fetch user requests' });
  }
};
