const User = require("../models/User")
const jwt = require('jsonwebtoken');


// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d' // Token expires in 1 day
  });
};

// --- REGISTER Logic ---
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // 2. Create new user
    // Note: To register with a higher-privileged role, this endpoint should be protected.
    // For simplicity, we allow any valid role from the request.
    const user = await User.create({
      name,
      email,
      password, // Password hashing is handled by the pre-save hook in the model
      role: role || 'Employee'
    });

    // 3. Success response
    if (user) {
      // Create a token to automatically log the user in
      const token = generateToken(user._id, user.role);
      res.status(201).json({
        message: 'Registration successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};


// --- LOGIN Logic ---
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user (explicitly select password)
    const user = await User.findOne({ email }).select('+password');

    // 2. Check user existence and password match
    if (user && (await user.matchPassword(password))) {
      // 3. Success response
      const token = generateToken(user._id, user.role);
      res.json({
        message: 'Login successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      // Optimization: Use a generic error message for security
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

