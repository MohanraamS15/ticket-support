const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // 🔍 DEBUG: Log the full token
      console.log("🔍 ========== AUTH MIDDLEWARE DEBUG ==========");
      console.log("🔍 Received token:", token);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 🔍 DEBUG: Log decoded payload
      console.log("🔍 Decoded JWT payload:", decoded);
      console.log("🔍 User ID from token:", decoded.id);

      const foundUser = await User.findById(decoded.id).select("-password");
      
      // 🔍 DEBUG: Log found user details
      console.log("🔍 Found user from DB:", foundUser);
      console.log("🔍 User._id:", foundUser?._id);
      console.log("🔍 User.email:", foundUser?.email);
      console.log("🔍 User.name:", foundUser?.name);
      console.log("🔍 ==========================================");
      
      if (!foundUser) {
        return res.status(401).json({ message: "User not found in database" });
      }

      req.user = foundUser;
      next();
    } catch (err) {
      console.error("❌ Auth middleware error:", err);
      res.status(401).json({ message: "Not authorized", error: err.message });
    }
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

module.exports = { protect };