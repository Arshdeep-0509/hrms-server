const roleService = require('./role.service');

class RoleController {
  /**
   * Fetch all roles & permissions
   * Accessible to Super Admin
   */
  async getAllRolesAndPermissions(req, res) {
    try {
      const roles = await roleService.getAllRolesAndPermissions();
      res.json(roles);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Error fetching roles' });
    }
  }

  /**
   * Update role of a user
   * Accessible to Super Admin and Client Admin
   */
  async updateUserRole(req, res) {
    try {
      const { userId, roleName } = req.body;
      const result = await roleService.updateUserRole(userId, roleName);
      res.json(result);
    } catch (error) {
      console.error('Error updating user role and permissions:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during role update' });
    }
  }

  /**
   * Get access rules for a specific role
   * Accessible to Super Admin
   */
  async getRoleAccessRules(req, res) {
    try {
      const { roleName } = req.params;
      const role = await roleService.getRoleAccessRules(roleName);
      res.json(role);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Error fetching role access rules' });
    }
  }

  /**
   * Get user role
   * Accessible to Super Admin
   */
  async getUserRole(req, res) {
    try {
      const { user_id } = req.params;
      const userRole = await roleService.getUserRole(user_id);
      res.json(userRole);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Error fetching user role' });
    }
  }

  /**
   * Modify access rights dynamically
   * Accessible to Super Admin
   */
  async modifyRoleAccess(req, res) {
    try {
      const { roleName } = req.params;
      const { permissions } = req.body;
      const result = await roleService.modifyRoleAccess(roleName, permissions);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Error modifying access rights' });
    }
  }
}

module.exports = new RoleController();

