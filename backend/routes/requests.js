const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequests, 
  acceptRequest, 
  completeRequest, 
  getMyRequests 
} = require('../controllers/requestController');
const Category = require('../models/Category');

// Create a new help request
router.post('/', createRequest);

// Get all pending requests
router.get('/', getRequests);

// Accept a help request
router.post('/:requestId/accept', acceptRequest);

// Complete a help request
router.post('/:requestId/complete', completeRequest);

// Get user's requests (both as requester and helper)
router.get('/my-requests/:userId', getMyRequests);

// Get all categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
