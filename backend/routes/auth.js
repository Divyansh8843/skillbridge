const express = require("express");
const router = express.Router();
const { body} = require("express-validator");
const {authenticateToken} =require("../middlewares/auth-middleware")
const userController=require("../controllers/authController")
// Login/Register with Google
router.post(
  "/google",
  [
    body("email").isEmail().normalizeEmail(),
    body("name").trim().isLength({ min: 1 }),
    body("googleId").trim().isLength({ min: 1 }),
    body("picture").optional().isURL(),
  ],
  userController.userRegister
);

// Get current user profile
router.get("/profile", authenticateToken, userController.userProfile)

// Verify token
router.get("/verify", authenticateToken, userController.verifyToken );

module.exports = router;
