const express = require("express");
const passport = require("passport");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const User = require(path.join(__dirname, "..", "models", "User"));
const config = require(path.join(__dirname, "..", "config", "config"));

const router = express.Router();

const jwtSecret = config.JWT_SECRET;
const ADMIN_INVITE_CODE = config.ADMIN_INVITE_CODE;

// Register user
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, inviteCode } = req.body;

    // Ensure email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Validate admin invite code for admin role
    if (role === "admin" && inviteCode !== ADMIN_INVITE_CODE) {
      return res
        .status(403)
        .json({ message: "Invalid invite code for admin registration" });
    }

    // Hash the password and create a new user
    //const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password,
      role,
      apiKey: uuidv4(),
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Ensure email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if the email is registered
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      console.log("User not found or email not registered");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid email or password match");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ token, apiKey: user.apiKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*// Login user
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(400).json(info);

    const token = jwt.sign(
      { email: user.email, role: user.role }, // Include email in the token payload
      config.jwtSecret,
      { expiresIn: "1h" }
    );
    res.json({ token, apiKey: user.apiKey });
  })(req, res, next);
});*/

// Logout user
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
});

module.exports = router;
