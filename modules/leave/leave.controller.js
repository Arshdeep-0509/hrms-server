const leaveService = require('./leave.service');

class LeaveController {
  /**
   * Apply for leave
   * Accessible by: All authenticated users
   */
  async applyForLeave(req, res) {
    try {
      const result = await leaveService.applyForLeave(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during leave application' });
    }
  }

  /**
   * Approve or reject leave
   * Accessible by: Super Admin, Client Admin
   */
  async approveOrRejectLeave(req, res) {
    try {
      const result = await leaveService.approveOrRejectLeave(parseInt(req.params.id), req.body, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during leave approval' });
    }
  }

  /**
   * Create leave policy
   * Accessible by: Super Admin, Client Admin
   */
  async createLeavePolicy(req, res) {
    try {
      const result = await leaveService.createLeavePolicy(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during policy creation' });
    }
  }

  /**
   * Get leave balance
   * Accessible by: Super Admin, Client Admin, Employee (own balance)
   */
  async getLeaveBalance(req, res) {
    try {
      const result = await leaveService.getLeaveBalance(parseInt(req.params.employeeId), req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during balance retrieval' });
    }
  }

  /**
   * Get leave reports
   * Accessible by: Super Admin, Client Admin
   */
  async getLeaveReports(req, res) {
    try {
      const result = await leaveService.getLeaveReports(req.query, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during report generation' });
    }
  }

  /**
   * Add holiday
   * Accessible by: Super Admin, Client Admin
   */
  async addHoliday(req, res) {
    try {
      const result = await leaveService.addHoliday(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during holiday addition' });
    }
  }

  /**
   * List holidays
   * Accessible by: Super Admin, Client Admin
   */
  async listHolidays(req, res) {
    try {
      const result = await leaveService.listHolidays(req.query, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during holiday retrieval' });
    }
  }

  /**
   * Get calendar view
   * Accessible by: Super Admin, Client Admin
   */
  async getCalendarView(req, res) {
    try {
      const result = await leaveService.getCalendarView(req.query, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during calendar generation' });
    }
  }

  /**
   * Create leave type
   * Accessible by: Super Admin, Client Admin
   */
  async createLeaveType(req, res) {
    try {
      const result = await leaveService.createLeaveType(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during leave type creation' });
    }
  }

  /**
   * List leave types
   * Accessible by: Super Admin, Client Admin
   */
  async listLeaveTypes(req, res) {
    try {
      const result = await leaveService.listLeaveTypes(req.query, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during leave type retrieval' });
    }
  }

  /**
   * Update leave type
   * Accessible by: Super Admin, Client Admin
   */
  async updateLeaveType(req, res) {
    try {
      const result = await leaveService.updateLeaveType(parseInt(req.params.id), req.body, req.user);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during leave type update' });
    }
  }
}

module.exports = new LeaveController();

