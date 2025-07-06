const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log("🔍 ========== REGISTRATION DEBUG ==========");
    console.log("🔍 Registration attempt for:", { name, email });
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    console.log("🔍 User exists?", userExists ? "YES" : "NO");
    
    if (userExists) {
      console.log("🔍 Existing user found:", userExists);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("🔍 NEW USER CREATED:");
    console.log("🔍 - ID:", user._id);
    console.log("🔍 - Name:", user.name);
    console.log("🔍 - Email:", user.email);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🔍 DEBUG: Verify the token we just created
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Generated token payload:", decoded);
    console.log("🔍 Token contains user ID:", decoded.id);
    console.log("🔍 ==========================================");

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔍 ========== LOGIN DEBUG ==========");
    console.log("🔍 Login attempt for email:", email);
    
    // Check if user exists
    const user = await User.findOne({ email });
    console.log("🔍 User found:", user ? "YES" : "NO");
    
    if (!user) {
      console.log("🔍 No user found with email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("🔍 Found user:");
    console.log("🔍 - ID:", user._id);
    console.log("🔍 - Name:", user.name);
    console.log("🔍 - Email:", user.email);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match:", isMatch ? "YES" : "NO");
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate new token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🔍 DEBUG: Verify the token we just created
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Generated token payload:", decoded);
    console.log("🔍 Token contains user ID:", decoded.id);
    console.log("🔍 ====================================");

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    });
  } catch (error) {
    console.error("❌ Profile error:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};