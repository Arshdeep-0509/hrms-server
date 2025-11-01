const departmentService = require('./department.service');

class DepartmentController {
  /**
   * List all departments (optionally filtered by organization)
   * Accessible by: Super Admin, Client Admin
   */
  async listDepartments(req, res) {
    try {
      const { organization_id } = req.query;
      const departments = await departmentService.listDepartments(req.user, organization_id ? parseInt(organization_id) : null);
      res.json(departments);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during department retrieval' });
    }
  }

  /**
   * Get department details by ID
   * Accessible by: Super Admin, Client Admin
   */
  async getDepartmentDetails(req, res) {
    try {
      const department = await departmentService.getDepartmentDetails(parseInt(req.params.id), req.user);
      res.json(department);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Error fetching department details' });
    }
  }

  /**
   * Create new department
   * Accessible by: Super Admin, Client Admin
   */
  async createDepartment(req, res) {
    try {
      const result = await departmentService.createDepartment(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during department creation' });
    }
  }

  /**
   * Update department information
   * Accessible by: Super Admin, Client Admin
   */
  async updateDepartment(req, res) {
    try {
      const result = await departmentService.updateDepartment(parseInt(req.params.id), req.body, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during department update' });
    }
  }

  /**
   * Delete department
   * Accessible by: Super Admin, Client Admin
   */
  async deleteDepartment(req, res) {
    try {
      const result = await departmentService.deleteDepartment(parseInt(req.params.id), req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during department deletion' });
    }
  }

  /**
   * Create role within department
   * Accessible by: Client Admin
   */
  async createRoleInDepartment(req, res) {
    try {
      const result = await departmentService.createRoleInDepartment(parseInt(req.params.id), req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during role creation' });
    }
  }

  /**
   * Assign employee to department
   * Accessible by: Client Admin
   */
  async assignEmployeeToDepartment(req, res) {
    try {
      const result = await departmentService.assignEmployeeToDepartment(parseInt(req.params.id), req.body, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during employee assignment' });
    }
  }
}

module.exports = new DepartmentController();

