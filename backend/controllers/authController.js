const User = require("../models/User");
const jwt = require("jsonwebtoken")
const {validationResult} =require("express-validator")
module.exports.userRegister=async(req,res)=>{
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
    
          const { email, name, googleId, picture } = req.body;
    
          // Check if user exists
          let user = await User.findOne({ 
            $or: [{ email }, { googleId }] 
          });
    
          if (user) {
            // Update existing user
            user.name = name;
            user.picture = picture;
            await user.save();
          } else {
            // Create new user
            user = new User({
              googleId,
              email,
              name,
              picture
            });
            await user.save();
          }
    
          // Generate JWT token
          const token = jwt.sign(
            {
              id: user._id,
              email: user.email,
              name: user.name,
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
          );
    
          res.json({
            token,
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
              picture: user.picture,
              bio: user.bio,
              skills: user.skills,
              rating: user.rating,
              totalReviews: user.totalReviews,
            },
          });
        } catch (error) {
          console.error("Google auth error:", error);
          res.status(500).json({ error: "Authentication failed" });
        }
      }

module.exports.userProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        bio: user.bio,
        skills: user.skills,
        rating: user.rating,
        totalReviews: user.totalReviews,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
};

module.exports.verifyToken = (req, res) => {
    res.json({ valid: true, user: req.user });
  }