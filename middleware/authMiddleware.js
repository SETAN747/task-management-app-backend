const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Assuming you have a User model

// Middleware to protect routes and attach full user object (including role) to req
const protect = async (req, res, next) => {
  // Get token from Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token and extract user ID from it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user's full data (including role) from the database
    const user = await User.findById(decoded.id).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user object to the req object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;
