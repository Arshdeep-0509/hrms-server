const User = require('../models/User');

// --- GET User Profile ---
// Accessible by the authenticated user themselves.
exports.getUserProfile = async (req, res) => {
  // req.user is populated by the 'protect' middleware
  const user = await User.findById(req.user.id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


// --- EDIT User Profile ---
// Allows the authenticated user to update their name, email, and/or password partially.
exports.updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    // Check if the body contains a value, otherwise keep the existing one.
    // This is the core logic that makes PATCH work.
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Password must be explicitly checked, as we don't want to hash an undefined value
    if (req.body.password) {
      // The pre-save hook in the User model will automatically hash the new password
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    
    // Respond with updated details (excluding password)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      message: 'Profile updated successfully'
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// --- DELETE User (RBAC Protected) ---
// Authority: Super Admin and Client Admin only.
exports.deleteUser = async (req, res) => {
  // The 'authorize' middleware already ensured the requester has the right role.
  
  try {
    const userToDelete = await User.findById(req.params.id);

    if (userToDelete) {
      await User.deleteOne({ _id: req.params.id }); // Use deleteOne for Mongoose 6+
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
};