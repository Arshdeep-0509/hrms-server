const employeeService = require('./employee.service');

class EmployeeController {
  /**
   * List all employees
   * Accessible by: Super Admin / Client Admin
   */
  async listEmployees(req, res) {
    try {
      const employees = await employeeService.listEmployees(req.query, req.user);
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during employee retrieval' });
    }
  }

  /**
   * Get employee by ID
   * Accessible by: Super Admin / Client Admin / Self
   */
  async getEmployee(req, res) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.employee_id, req.user);
      res.json(employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during employee retrieval' });
    }
  }

  /**
   * Create new employee
   * Accessible by: Client Admin / HR Manager
   */
  async createEmployee(req, res) {
    try {
      const result = await employeeService.createEmployee(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating employee:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during employee creation' });
    }
  }

  /**
   * Update employee details
   * Accessible by: Client Admin / HR
   */
  async updateEmployee(req, res) {
    try {
      const result = await employeeService.updateEmployee(req.params.employee_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating employee:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during employee update' });
    }
  }

  /**
   * Update employee status (activate/deactivate/terminate)
   * Accessible by: Client Admin / HR
   */
  async updateEmployeeStatus(req, res) {
    try {
      const result = await employeeService.updateEmployeeStatus(req.params.employee_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating employee status:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during employee status update' });
    }
  }

  /**
   * Upload document for employee
   * Accessible by: HR / Employee
   */
  async uploadDocument(req, res) {
    try {
      const result = await employeeService.uploadDocument(req.params.employee_id, req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error uploading document:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during document upload' });
    }
  }

  /**
   * Trigger onboarding workflow
   * Accessible by: HR / Client Admin
   */
  async startOnboarding(req, res) {
    try {
      const result = await employeeService.startOnboarding(req.params.employee_id, req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error starting onboarding:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during onboarding initiation' });
    }
  }

  /**
   * Trigger offboarding workflow
   * Accessible by: HR / Client Admin
   */
  async startOffboarding(req, res) {
    try {
      const result = await employeeService.startOffboarding(req.params.employee_id, req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error starting offboarding:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during offboarding initiation' });
    }
  }
}

module.exports = new EmployeeController();
