const { LeaveRequest, LeavePolicy, LeaveBalance, Holiday, LeaveType } = require('./leave.schema');
const Employee = require('../employee/employee.schema');
const Organization = require('../organization/organization.schema');
const User = require('../user/user.schema');

class LeaveService {
  /**
   * Apply for leave
   * @param {Object} leaveData - Leave request data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created leave request
   */
  async applyForLeave(leaveData, user) {
    const { leave_type_id, startDate, endDate, reason } = leaveData;

    // Find employee
    const employee = await Employee.findOne({ user_id: user.user_id });
    if (!employee) {
      throw { statusCode: 404, message: 'Employee record not found' };
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      throw { statusCode: 400, message: 'End date must be after start date' };
    }

    // Calculate days (excluding weekends, but including holidays - can be enhanced)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = await LeaveBalance.findOne({
      employee_id: employee.employee_id,
      leave_type_id,
      year: currentYear
    });

    if (!balance || balance.balance < days) {
      throw { statusCode: 400, message: 'Insufficient leave balance' };
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employee_id: employee.employee_id,
      organization_id: employee.organization_id,
      leave_type_id,
      startDate: start,
      endDate: end,
      days,
      reason
    });

    return {
      message: 'Leave request submitted successfully',
      leaveRequest
    };
  }

  /**
   * Approve or reject leave
   * @param {Number} leaveId - Leave request ID
   * @param {Object} actionData - Action data (status, rejectionReason)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated leave request
   */
  async approveOrRejectLeave(leaveId, actionData, user) {
    const { status, rejectionReason } = actionData;

    if (!['Approved', 'Rejected'].includes(status)) {
      throw { statusCode: 400, message: 'Status must be Approved or Rejected' };
    }

    const leaveRequest = await LeaveRequest.findOne({ leave_id: leaveId });
    if (!leaveRequest) {
      throw { statusCode: 404, message: 'Leave request not found' };
    }

    // Update leave request
    leaveRequest.status = status;
    leaveRequest.approvedBy = user.user_id;
    leaveRequest.approvedAt = new Date();
    if (status === 'Rejected' && rejectionReason) {
      leaveRequest.rejectionReason = rejectionReason;
    }

    await leaveRequest.save();

    // If approved, update leave balance
    if (status === 'Approved') {
      const currentYear = new Date().getFullYear();
      const balance = await LeaveBalance.findOne({
        employee_id: leaveRequest.employee_id,
        leave_type_id: leaveRequest.leave_type_id,
        year: currentYear
      });

      if (balance) {
        balance.used += leaveRequest.days;
        balance.balance = balance.totalAllocated - balance.used + balance.carryForward;
        await balance.save();
      }
    }

    return {
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest
    };
  }

  /**
   * Create leave policy
   * @param {Object} policyData - Policy data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created policy
   */
  async createLeavePolicy(policyData, user) {
    const { organization_id, leave_type_id, maxDays, carryForward, maxCarryForwardDays, requiresApproval, minNoticeDays } = policyData;

    // Verify organization access
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You can only create policies for your organization' };
      }
    }

    const policy = await LeavePolicy.create({
      organization_id,
      leave_type_id,
      maxDays,
      carryForward,
      maxCarryForwardDays,
      requiresApproval,
      minNoticeDays
    });

    return {
      message: 'Leave policy created successfully',
      policy
    };
  }

  /**
   * Get leave balance for employee
   * @param {Number} employeeId - Employee ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Leave balances
   */
  async getLeaveBalance(employeeId, user) {
    const employee = await Employee.findOne({ employee_id: employeeId });
    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found' };
    }

    // Authorization check
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || employee.organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee' };
      }
    }

    const currentYear = new Date().getFullYear();
    const balances = await LeaveBalance.find({
      employee_id: employeeId,
      year: currentYear
    });

    // Fetch leave type details for each balance
    const balancesWithTypes = await Promise.all(
      balances.map(async (balance) => {
        const leaveType = await LeaveType.findOne({ leave_type_id: balance.leave_type_id });
        return {
          ...balance.toObject(),
          leaveType: leaveType ? { name: leaveType.name, code: leaveType.code } : null
        };
      })
    );

    return balancesWithTypes;
  }

  /**
   * Get leave trends report
   * @param {Object} filters - Report filters
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Report data
   */
  async getLeaveReports(filters, user) {
    let query = {};

    // Client Admin restriction
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org) {
        return { trends: [], statistics: {} };
      }
      query.organization_id = org.organization_id;
    } else if (filters.organization_id) {
      query.organization_id = parseInt(filters.organization_id);
    }

    // Date filters
    if (filters.startDate && filters.endDate) {
      query.startDate = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
    }

    const leaves = await LeaveRequest.find(query);

    // Calculate statistics
    const stats = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === 'Approved').length,
      pending: leaves.filter(l => l.status === 'Pending').length,
      rejected: leaves.filter(l => l.status === 'Rejected').length,
      totalDays: leaves.filter(l => l.status === 'Approved').reduce((sum, l) => sum + l.days, 0)
    };

    return {
      trends: leaves,
      statistics: stats
    };
  }

  /**
   * Add organization-level holiday
   * @param {Object} holidayData - Holiday data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created holiday
   */
  async addHoliday(holidayData, user) {
    const { organization_id, name, date, type, recurring, description } = holidayData;

    // Verify organization access
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You can only add holidays for your organization' };
      }
    }

    const holiday = await Holiday.create({
      organization_id,
      name,
      date: new Date(date),
      type,
      recurring,
      description
    });

    return {
      message: 'Holiday added successfully',
      holiday
    };
  }

  /**
   * List holidays for organization/year
   * @param {Object} filters - Filter options
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} List of holidays
   */
  async listHolidays(filters, user) {
    let query = {};

    // Client Admin restriction
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org) {
        return [];
      }
      query.organization_id = org.organization_id;
    } else if (filters.organization_id) {
      query.organization_id = parseInt(filters.organization_id);
    }

    // Year filter
    if (filters.year) {
      const year = parseInt(filters.year);
      query.date = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31)
      };
    }

    return await Holiday.find(query).sort({ date: 1 });
  }

  /**
   * Generate calendar view (holidays + approved leaves)
   * @param {Object} filters - Filter options
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Calendar data
   */
  async getCalendarView(filters, user) {
    const { organization_id, year, month } = filters;
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    let orgId = organization_id;
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org) {
        return { holidays: [], leaves: [] };
      }
      orgId = org.organization_id;
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    // Get holidays
    const holidays = await Holiday.find({
      organization_id: orgId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Get approved leaves
    const leaves = await LeaveRequest.find({
      organization_id: orgId,
      status: 'Approved',
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ]
    });

    // Fetch employee details for each leave
    const leavesWithEmployees = await Promise.all(
      leaves.map(async (leave) => {
        const employee = await Employee.findOne({ employee_id: leave.employee_id });
        return {
          ...leave.toObject(),
          employee: employee ? { firstName: employee.firstName, lastName: employee.lastName } : null
        };
      })
    );

    return {
      holidays,
      leaves: leavesWithEmployees,
      year: targetYear,
      month: targetMonth
    };
  }

  /**
   * Create new leave type
   * @param {Object} typeData - Leave type data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created leave type
   */
  async createLeaveType(typeData, user) {
    const { organization_id, name, code, description, isPaid, maxLimit, carryForward, maxCarryForward, requiresApproval } = typeData;

    // Verify organization access
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You can only create leave types for your organization' };
      }
    }

    // Check if code already exists
    const existingType = await LeaveType.findOne({ organization_id, code });
    if (existingType) {
      throw { statusCode: 400, message: 'Leave type with this code already exists' };
    }

    const leaveType = await LeaveType.create({
      organization_id,
      name,
      code,
      description,
      isPaid,
      maxLimit,
      carryForward,
      maxCarryForward,
      requiresApproval
    });

    return {
      message: 'Leave type created successfully',
      leaveType
    };
  }

  /**
   * List all leave types
   * @param {Object} filters - Filter options
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} List of leave types
   */
  async listLeaveTypes(filters, user) {
    let query = { active: true };

    // Client Admin restriction
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org) {
        return [];
      }
      query.organization_id = org.organization_id;
    } else if (filters.organization_id) {
      query.organization_id = parseInt(filters.organization_id);
    }

    return await LeaveType.find(query).sort({ name: 1 });
  }

  /**
   * Update leave type
   * @param {Number} typeId - Leave type ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated leave type
   */
  async updateLeaveType(typeId, updateData, user) {
    const leaveType = await LeaveType.findOne({ leave_type_id: typeId });
    if (!leaveType) {
      throw { statusCode: 404, message: 'Leave type not found' };
    }

    // Verify organization access
    if (user.role === 'Client Admin') {
      const org = await Organization.findOne({ clientAdmin: user.user_id.toString() });
      if (!org || leaveType.organization_id !== org.organization_id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this leave type' };
      }
    }

    // Update fields
    Object.assign(leaveType, updateData);
    await leaveType.save();

    return {
      message: 'Leave type updated successfully',
      leaveType
    };
  }
}

module.exports = new LeaveService();

