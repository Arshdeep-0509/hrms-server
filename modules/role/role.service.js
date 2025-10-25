const Role = require('./role.schema');
const User = require('../user/user.schema');

class RoleService {
  /**
   * Get all roles and permissions
   * @returns {Promise<Array>} Array of all roles
   */
  async getAllRolesAndPermissions() {
    return await Role.find({});
  }

  /**
   * Get role by name
   * @param {String} roleName - Role name
   * @returns {Promise<Object>} Role object
   */
  async getRoleByName(roleName) {
    const role = await Role.findOne({ name: roleName });
    
    if (!role) {
      throw { statusCode: 404, message: `Role "${roleName}" not found.` };
    }
    
    return role;
  }

  /**
   * Update user role
   * @param {String} userId - User ID
   * @param {String} roleName - New role name
   * @returns {Promise<Object>} Updated user with role
   */
  async updateUserRole(userId, roleName) {
    if (!userId || !roleName) {
      throw { statusCode: 400, message: 'User ID and Role Name are required.' };
    }

    // Define permissions logic for consistency
    const adminRoles = ['Super Admin', 'Client Admin'];
    const adminPermissions = [
      'user:read', 'user:write', 'user:delete', 
      'payroll:read', 'payroll:write', 
      'recruitment:read', 'recruitment:write', 
      'reports:read', 'reports:export', 
      'role:manage'
    ];

    // 1. Role Initialization/Update Logic (Roles Schema)
    // Ensures the target role exists in the Role schema with the correct default permissions.
    const initialPermissions = adminRoles.includes(roleName) ? adminPermissions : [];
    
    await Role.findOneAndUpdate(
      { name: roleName },
      { $set: { permissions: initialPermissions } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. User Role Update Logic (User Schema)
    const user = await User.findById(userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    // Update the user's role
    const oldRole = user.role;
    user.role = roleName;
    await user.save();

    return {
      message: `Role successfully updated from ${oldRole} to ${roleName} for user ${user.email}. Role permissions definition was also updated/created.`,
      user: { id: user._id, role: user.role }
    };
  }

  /**
   * Get access rules for a specific role
   * @param {String} roleName - Role name
   * @returns {Promise<Object>} Role with permissions
   */
  async getRoleAccessRules(roleName) {
    return await this.getRoleByName(roleName);
  }

  /**
   * Modify role access permissions
   * @param {String} roleName - Role name
   * @param {Array} permissions - Array of permissions
   * @returns {Promise<Object>} Updated role
   */
  async modifyRoleAccess(roleName, permissions) {
    if (!Array.isArray(permissions)) {
      throw { statusCode: 400, message: 'Permissions must be an array.' };
    }

    const role = await Role.findOneAndUpdate(
      { name: roleName },
      { $set: { permissions: permissions } },
      { new: true, upsert: false }
    );

    if (!role) {
      throw { statusCode: 404, message: `Role "${roleName}" not found.` };
    }

    return {
      message: `Access rights for role ${roleName} updated successfully.`,
      role
    };
  }
}

module.exports = new RoleService();

