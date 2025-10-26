const userService = require('./user.service');

class UserController {
  /**
   * GET User Profile
   * Accessible by the authenticated user themselves
   */
  async getUserProfile(req, res) {
    try {
      const profile = await userService.getUserProfile(req.user.user_id);
      res.json(profile);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error' });
    }
  }

  /**
   * PATCH User Profile
   * Allows the authenticated user to update their name, email, and/or password partially
   */
  async updateUserProfile(req, res) {
    try {
      const updatedProfile = await userService.updateUserProfile(req.user.user_id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error' });
    }
  }

  /**
   * DELETE User (RBAC Protected)
   * Authority: Super Admin and Client Admin only
   */
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.user_id);
      res.json(result);
    } catch (error) {
      console.error('Delete User Error:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during user deletion' });
    }
  }
}

module.exports = new UserController();

