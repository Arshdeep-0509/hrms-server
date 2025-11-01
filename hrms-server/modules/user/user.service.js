const User = require('./user.schema');
const Employee = require('../employee/employee.schema');
const Organization = require('../organization/organization.schema');
const Department = require('../department/department.schema');

class UserService {
  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    return await User.findOne({ user_id: userId }).select('-password');
  }

  /**
   * Get user profile
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    const user = await User.findOne({ user_id: userId }).select('-password');
    
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      user_id: user.user_id,
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
    const user = await User.findOne({ user_id: userId });

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
      user_id: updatedUser.user_id,
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
    const userToDelete = await User.findOne({ user_id: userId });

    if (!userToDelete) {
      throw { statusCode: 404, message: 'User not found' };
    }

    await User.deleteOne({ user_id: userId });
    
    return { message: 'User removed successfully' };
  }

  /**
   * List all users with optional filters (by org/department/role)
   * @param {Object} user - Current authenticated user
   * @param {Object} filters - Filter options (organization_id, department_id, role)
   * @returns {Promise<Array>} Array of users
   */
  async listUsers(user, filters = {}) {
    // Super Admin can see all users
    // Client Admin can only see users from their organization
    let query = {};

    // Client Admin restriction - they can see users from their organization
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org) {
        return [];
      }
      // Always filter by their organization
      filters.organization_id = org.organization_id;
    }

    // Apply filters
    if (filters.organization_id || filters.department_id || filters.role) {
      // Find employees matching filters
      const employeeQuery = {};
      if (filters.organization_id) {
        employeeQuery.organization_id = parseInt(filters.organization_id);
      }
      if (filters.department_id) {
        employeeQuery.department_id = parseInt(filters.department_id);
      }
      if (filters.role) {
        // Note: role filtering through employee role_id would need role-to-name mapping
        // For now, we'll filter by user role
      }

      const employees = await Employee.find(employeeQuery).select('user_id');
      const userIds = employees.map(emp => emp.user_id);

      if (filters.role) {
        query.role = filters.role;
      }
      if (userIds.length > 0) {
        query.user_id = { $in: userIds };
      } else if (filters.organization_id || filters.department_id) {
        // No employees found matching filters
        return [];
      }
    } else if (filters.role) {
      query.role = filters.role;
    }

    return await User.find(query).select('-password').sort({ createdAt: -1 });
  }

  /**
   * Create new user
   * @param {Object} userData - User data (name, email, password, role)
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData, currentUser) {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw { statusCode: 400, message: 'User already exists with this email.' };
    }

    // Client Admin can only create users with specific roles
    if (currentUser.role === 'Client Admin') {
      const allowedRoles = ['Employee', 'HR Account Manager', 'Payroll Specialist', 'Recruitment Specialist'];
      if (!allowedRoles.includes(role)) {
        throw { statusCode: 403, message: 'Forbidden: You can only create users with roles: ' + allowedRoles.join(', ') };
      }
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee'
    });

    return {
      message: 'User created successfully',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  /**
   * Update user info or status
   * @param {Number} userId - User ID
   * @param {Object} updateData - Data to update
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData, currentUser) {
    const user = await User.findOne({ user_id: userId });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Client Admin can only update users from their organization
    if (currentUser.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: currentUser.user_id.toString() });
      if (org) {
        const employee = await Employee.findOne({ user_id: userId, organization_id: org.organization_id });
        if (!employee) {
          throw { statusCode: 403, message: 'Forbidden: You can only update users from your organization.' };
        }
      }
    }

    // Update allowed fields
    if (updateData.name !== undefined) {
      user.name = updateData.name;
    }
    if (updateData.email !== undefined) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({ email: updateData.email, user_id: { $ne: userId } });
      if (emailExists) {
        throw { statusCode: 400, message: 'Email already exists' };
      }
      user.email = updateData.email;
    }
    if (updateData.password !== undefined) {
      user.password = updateData.password;
    }
    if (updateData.role !== undefined) {
      // Client Admin restrictions on role updates
      if (currentUser.role === 'Client Admin') {
        const allowedRoles = ['Employee', 'HR Account Manager', 'Payroll Specialist', 'Recruitment Specialist'];
        if (!allowedRoles.includes(updateData.role)) {
          throw { statusCode: 403, message: 'Forbidden: You can only assign roles: ' + allowedRoles.join(', ') };
        }
      }
      user.role = updateData.role;
    }

    const updatedUser = await user.save();

    return {
      message: 'User updated successfully',
      user: {
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    };
  }
}

module.exports = new UserService();

