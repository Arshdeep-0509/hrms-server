const User = require("../models/User")
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');


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
    
    // Determine the role to be assigned (default to Employee if not provided)
    const assignedRole = role || 'Employee';

    // 2. Define permissions based on the role
    const adminRoles = ['Super Admin', 'Client Admin'];
    const adminPermissions = [
      'user:read', 'user:write', 'user:delete', 
      'payroll:read', 'payroll:write', 
      'recruitment:read', 'recruitment:write', 
      'reports:read', 'reports:export', 
      'role:manage'
    ];
    
    // Set permissions based on the assigned role
    const initialPermissions = adminRoles.includes(assignedRole) 
      ? adminPermissions 
      : []; // <-- Gives empty permissions for all other roles

    // 3. CRUCIAL STEP: Ensure the Role document exists with defined permissions
    // Upsert: true means if the role doesn't exist, it creates it.
    await Role.findOneAndUpdate(
      { name: assignedRole },
      { $set: { permissions: initialPermissions } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 4. Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole
    });

    // 5. Success response
    if (user) {
      const token = generateToken(user._id, user.role);
      res.status(201).json({
        message: 'Registration successful, and role permissions initialized.',
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

// --- LOGOUT Logic  ---
exports.logoutUser = (req, res) => {
  // For JWT-based authentication, logout is usually client-side (deleting the token).
  // On the server side, we can confirm the action and optionally blacklist the token (advanced).
  // For simplicity and optimization, we just send a success message.

  // NOTE: If you implemented token blacklisting, that logic would go here.
  
  res.status(200).json({ 
      message: 'Logged out successfully. Token should be deleted client-side.' 
  });
};