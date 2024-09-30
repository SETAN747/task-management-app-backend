const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      // password: hashedPassword,
      role,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: " email does not exists " });
    }

    // Check if the password is correct

    // Log for debugging
    // console.log("Entered Password:", password);
    // console.log("Hashed Password from DB:", user.password);
    // const isMatch = await bcrypt.compare(password, user.password); // Compare with hashed password
    // if (!isMatch) {
    //   return res.status(400).json({ message: " password not correct" });
    // }

    // Simple password comparison
    if (password !== user.password) {
      return res.status(400).json({ message: "Password not correct" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    // expiresIn: "1h", // Token will expire in 1 hour

    // Send the token in response
    res.status(200).json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
