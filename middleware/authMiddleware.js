// This Role-Based Access Control (RBAC) Middleware is crucial for an 
// industry-level setup to protect routes based on the user's role after they log in.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes (Authentication)
exports.protect = async (req, res, next) => {
  let token;

  // Check for 'Bearer' token in the header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user object (without password) to the request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware for Role-Based Access Control (Authorization)
// Accepts an array of allowed roles
exports.authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowedRoles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: User role '${req.user.role}' is not allowed to access this resource.` 
      });
    }
    next(); // Role is authorized
  };
};

// Example Usage (in another route file, e.g., 'userRoutes.js'):
/*
// 1. Get user profile (only authenticated users)
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

// 2. Access Admin Dashboard (Only Super Admin and Client Admin)
router.get('/admin/dashboard', protect, authorize(['Super Admin', 'Client Admin']), (req, res) => {
  res.send('Welcome to the Admin Dashboard!');
});

// 3. Payroll operations (Only Payroll Specialist)
router.post('/payroll/run', protect, authorize(['Payroll Specialist']), (req, res) => {
  res.send('Payroll run initiated.');
});
*/