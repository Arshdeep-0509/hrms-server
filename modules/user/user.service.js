const User = require('./user.schema');

class UserService {
  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    return await User.findById(userId).select('-password');
  }

  /**
   * Get user profile
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update (name, email, password)
   * @returns {Promise<Object>} Updated user profile
   */
  async updateUserProfile(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Check if the body contains a value, otherwise keep the existing one
    user.name = updateData.name || user.name;
    user.email = updateData.email || user.email;

    // Password must be explicitly checked
    if (updateData.password) {
      user.password = updateData.password;
    }

    const updatedUser = await user.save();

    return {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      message: 'Profile updated successfully'
    };
  }

  /**
   * Delete user by ID
   * @param {String} userId - User ID to delete
   * @returns {Promise<Object>} Success message
   */
  async deleteUser(userId) {
    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      throw { statusCode: 404, message: 'User not found' };
    }

    await User.deleteOne({ _id: userId });
    
    return { message: 'User removed successfully' };
  }
}

module.exports = new UserService();

