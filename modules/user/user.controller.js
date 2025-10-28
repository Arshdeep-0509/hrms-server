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

  /**
   * GET List all users (with filters by org/department/role)
   * Accessible by: Super Admin (all users), Client Admin (their org only)
   */
  async listUsers(req, res) {
    try {
      const filters = {
        organization_id: req.query.organization_id,
        department_id: req.query.department_id,
        role: req.query.role
      };
      const users = await userService.listUsers(req.user, filters);
      res.json(users);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during user retrieval' });
    }
  }

  /**
   * POST Create new user (employee, admin, etc.)
   * Accessible by: Super Admin, Client Admin
   */
  async createUser(req, res) {
    try {
      const result = await userService.createUser(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during user creation' });
    }
  }

  /**
   * PATCH Update user info or status
   * Accessible by: Super Admin, Client Admin
   */
  async updateUser(req, res) {
    try {
      const result = await userService.updateUser(parseInt(req.params.id), req.body, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during user update' });
    }
  }
}

module.exports = new UserController();

