const Department = require('./department.schema');
const Organization = require('../organization/organization.schema');
const User = require('../user/user.schema');
const Employee = require('../employee/employee.schema');

class DepartmentService {
  /**
   * List all departments, optionally filtered by organization
   * @param {Object} user - Current authenticated user
   * @param {Number} organizationId - Optional organization ID filter
   * @returns {Promise<Array>} Array of departments
   */
  async listDepartments(user, organizationId) {
    let query = {};

    // Filter by organization if provided
    if (organizationId) {
      query.organization_id = organizationId;
    }

    // Client Admin can only see departments from their organization
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org) {
        return [];
      }
      query.organization_id = org.organization_id;
    }

    return await Department.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get department details by ID
   * @param {Number} departmentId - Department ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Department details
   */
  async getDepartmentDetails(departmentId, user) {
    const department = await Department.findOne({ department_id: departmentId });

    if (!department) {
      throw { statusCode: 404, message: 'Department not found' };
    }

    // Authorization check for Client Admin: must be from their organization
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || department.organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this department.' };
      }
    }

    return department;
  }

  /**
   * Create new department
   * @param {Object} departmentData - Department data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created department
   */
  async createDepartment(departmentData, user) {
    const { organization_id, name, description, manager, budget, location, metadata } = departmentData;

    // Verify organization exists
    const organization = await Organization.findOne({ organization_id });

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    // Authorization check for Client Admin: must be their organization
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You can only create departments in your organization.' };
      }
    }

    // Verify manager exists if provided
    if (manager) {
      const managerUser = await User.findOne({ user_id: manager });
      if (!managerUser) {
        throw { statusCode: 404, message: 'Manager user not found' };
      }
    }

    const department = await Department.create({
      organization_id,
      name,
      description,
      manager,
      budget,
      location,
      metadata
    });

    return {
      message: 'Department created successfully',
      department
    };
  }

  /**
   * Update department information
   * @param {Number} departmentId - Department ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated department
   */
  async updateDepartment(departmentId, updateData, user) {
    const department = await Department.findOne({ department_id: departmentId });

    if (!department) {
      throw { statusCode: 404, message: 'Department not found' };
    }

    // Authorization check for Client Admin: must be from their organization
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || department.organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this department.' };
      }
    }

    // Verify manager exists if being updated
    if (updateData.manager) {
      const managerUser = await User.findOne({ user_id: updateData.manager });
      if (!managerUser) {
        throw { statusCode: 404, message: 'Manager user not found' };
      }
    }

    // Update department
    Object.assign(department, updateData);
    await department.save();

    return {
      message: 'Department updated successfully',
      department
    };
  }

  /**
   * Delete department
   * @param {Number} departmentId - Department ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async deleteDepartment(departmentId, user) {
    const department = await Department.findOne({ department_id: departmentId });

    if (!department) {
      throw { statusCode: 404, message: 'Department not found' };
    }

    // Authorization check for Client Admin: must be from their organization
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || department.organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this department.' };
      }
    }

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({ department_id: department.department_id });
    if (employeeCount > 0) {
      throw { statusCode: 400, message: `Cannot delete department. It has ${employeeCount} employee(s) assigned. Please reassign employees first.` };
    }

    await Department.deleteOne({ department_id: departmentId });

    return { message: 'Department deleted successfully' };
  }

  /**
   * Create role within department
   * @param {Number} departmentId - Department ID
   * @param {Object} roleData - Role data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async createRoleInDepartment(departmentId, roleData, user) {
    const department = await Department.findOne({ department_id: departmentId });

    if (!department) {
      throw { statusCode: 404, message: 'Department not found' };
    }

    // Authorization check: Only Client Admin can create roles
    if (user.role !== 'Client Admin') {
      throw { statusCode: 403, message: 'Forbidden: Only Client Admin can create roles in departments.' };
    }

    // Verify organization access
    const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
    if (!org || department.organization_id !== org.organization_id) {
      throw { statusCode: 403, message: 'Forbidden: You do not have access to this department.' };
    }

    // Note: This creates a role entry - you may want to integrate with your Role model
    // For now, we'll return a success message
    return {
      message: 'Role created in department successfully',
      department_id: departmentId,
      role: roleData
    };
  }

  /**
   * Assign employee to department
   * @param {Number} departmentId - Department ID
   * @param {Object} assignmentData - Assignment data (employee_id)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async assignEmployeeToDepartment(departmentId, assignmentData, user) {
    const { employee_id } = assignmentData;

    if (!employee_id) {
      throw { statusCode: 400, message: 'Employee ID is required' };
    }

    const department = await Department.findOne({ department_id: departmentId });

    if (!department) {
      throw { statusCode: 404, message: 'Department not found' };
    }

    // Authorization check: Only Client Admin can assign employees
    if (user.role !== 'Client Admin') {
      throw { statusCode: 403, message: 'Forbidden: Only Client Admin can assign employees to departments.' };
    }

    // Verify organization access
    const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
    if (!org || department.organization_id !== org.organization_id) {
      throw { statusCode: 403, message: 'Forbidden: You do not have access to this department.' };
    }

    // Find and update employee
    const employee = await Employee.findOne({ employee_id });

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found' };
    }

    // Update employee's department
    employee.department_id = department.department_id;
    await employee.save();

    // Update department head count
    const headCount = await Employee.countDocuments({ department_id: department.department_id });
    department.headCount = headCount;
    await department.save();

    return {
      message: 'Employee assigned to department successfully',
      department_id: departmentId,
      employee_id: employee_id
    };
  }
}

module.exports = new DepartmentService();

