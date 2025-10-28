const { AttendanceRecord, Shift, OvertimeRecord, AttendanceReport } = require('./attendance.schema');
const Employee = require('../employee/employee.schema');
const Organization = require('../organization/organization.schema');
const User = require('../user/user.schema');

class AttendanceService {
  /**
   * Clock in for an employee
   * @param {Object} clockInData - Clock in data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Clock in result
   */
  async clockIn(clockInData, user) {
    const { employeeId, location, deviceInfo, method, notes } = clockInData;

    // Find employee
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check - Employee can only clock in for themselves
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && user.role !== 'HR Account Manager') {
      if (employee.user.toString() !== user.id) {
        throw { statusCode: 403, message: 'Forbidden: You can only clock in for yourself.' };
      }
    }

    // Check if employee is already clocked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecord = await AttendanceRecord.findOne({
      employee: employee._id,
      workDate: {
        $gte: today,
        $lt: tomorrow,
      },
      'clockIn.timestamp': { $exists: true },
      'clockOut.timestamp': { $exists: false },
    });

    if (existingRecord) {
      throw { statusCode: 400, message: 'You are already clocked in for today.' };
    }

    // Generate attendance ID
    const attendanceId = Date.now() + Math.floor(Math.random() * 1000);

    // Create attendance record
    const attendanceRecord = await AttendanceRecord.create({
      attendance_id: attendanceId,
      employee: employee._id,
      employee_id: employee.employee_id,
      organization: employee.organization,
      organization_id: employee.organization_id,
      clockIn: {
        timestamp: new Date(),
        location,
        deviceInfo,
        method: method || 'Mobile App',
        notes,
      },
      workDate: today,
      status: 'Present',
      createdBy: user.id,
    });

    await attendanceRecord.populate([
      { path: 'employee', select: 'firstName lastName employee_id position department' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Clock in successful',
      attendanceRecord,
    };
  }

  /**
   * Clock out for an employee
   * @param {Object} clockOutData - Clock out data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Clock out result
   */
  async clockOut(clockOutData, user) {
    const { employeeId, location, deviceInfo, method, notes } = clockOutData;

    // Find employee
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check - Employee can only clock out for themselves
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && user.role !== 'HR Account Manager') {
      if (employee.user.toString() !== user.id) {
        throw { statusCode: 403, message: 'Forbidden: You can only clock out for yourself.' };
      }
    }

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendanceRecord = await AttendanceRecord.findOne({
      employee: employee._id,
      workDate: {
        $gte: today,
        $lt: tomorrow,
      },
      'clockIn.timestamp': { $exists: true },
      'clockOut.timestamp': { $exists: false },
    });

    if (!attendanceRecord) {
      throw { statusCode: 400, message: 'You are not clocked in for today.' };
    }

    // Update clock out information
    attendanceRecord.clockOut = {
      timestamp: new Date(),
      location,
      deviceInfo,
      method: method || 'Mobile App',
      notes,
    };

    // Calculate total hours
    const clockInTime = new Date(attendanceRecord.clockIn.timestamp);
    const clockOutTime = new Date(attendanceRecord.clockOut.timestamp);
    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Convert to hours

    attendanceRecord.totalHours = Math.round(totalHours * 100) / 100; // Round to 2 decimal places
    attendanceRecord.regularHours = Math.min(attendanceRecord.totalHours, 8); // Assuming 8 hours regular
    attendanceRecord.overtimeHours = Math.max(0, attendanceRecord.totalHours - 8);

    // Update status based on hours
    if (attendanceRecord.totalHours < 4) {
      attendanceRecord.status = 'Half Day';
    } else if (attendanceRecord.totalHours >= 8) {
      attendanceRecord.status = 'Present';
    }

    attendanceRecord.updatedBy = user.id;
    await attendanceRecord.save();

    // Create overtime record if applicable
    if (attendanceRecord.overtimeHours > 0) {
      await this.createOvertimeRecord(attendanceRecord, user);
    }

    await attendanceRecord.populate([
      { path: 'employee', select: 'firstName lastName employee_id position department' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Clock out successful',
      attendanceRecord,
    };
  }

  /**
   * Create overtime record
   * @param {Object} attendanceRecord - Attendance record
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created overtime record
   */
  async createOvertimeRecord(attendanceRecord, user) {
    const overtimeId = Date.now() + Math.floor(Math.random() * 1000);

    // Get employee salary for rate calculation
    const employee = await Employee.findById(attendanceRecord.employee);
    const hourlyRate = (employee.salary?.amount || 0) / (8 * 22); // Assuming 8 hours per day, 22 working days per month

    const overtimeRecord = await OvertimeRecord.create({
      overtime_id: overtimeId,
      employee: attendanceRecord.employee,
      employee_id: attendanceRecord.employee_id,
      organization: attendanceRecord.organization,
      organization_id: attendanceRecord.organization_id,
      attendanceRecord: attendanceRecord._id,
      attendance_id: attendanceRecord.attendance_id,
      overtimeDate: attendanceRecord.workDate,
      overtimeType: 'Daily',
      regularHours: attendanceRecord.regularHours,
      overtimeHours: attendanceRecord.overtimeHours,
      regularRate: hourlyRate,
      overtimeRate: hourlyRate * 1.5,
      regularPay: attendanceRecord.regularHours * hourlyRate,
      overtimePay: attendanceRecord.overtimeHours * hourlyRate * 1.5,
      totalOvertimePay: (attendanceRecord.regularHours * hourlyRate) + (attendanceRecord.overtimeHours * hourlyRate * 1.5),
      createdBy: user.id,
    });

    return overtimeRecord;
  }

  /**
   * Create a new shift
   * @param {Object} shiftData - Shift data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created shift
   */
  async createShift(shiftData, user) {
    const {
      organization,
      organization_id,
      name,
      description,
      startTime,
      endTime,
      breakDuration,
      breakTimes,
      workingDays,
      overtimeRules,
      notes,
    } = shiftData;

    // Validate organization access
    let organizationId = organization;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    } else {
      const org = await Organization.findById(organization);
      if (!org) {
        throw { statusCode: 404, message: 'Organization not found.' };
      }
    }

    // Calculate duration
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    let duration = (end - start) / (1000 * 60 * 60); // Convert to hours

    // Handle overnight shifts
    if (duration < 0) {
      duration += 24;
    }

    // Generate shift ID
    const shiftId = Date.now() + Math.floor(Math.random() * 1000);

    const shift = await Shift.create({
      shift_id: shiftId,
      organization: organizationId,
      organization_id,
      name,
      description,
      startTime,
      endTime,
      duration,
      breakDuration: breakDuration || 0,
      breakTimes: breakTimes || [],
      workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      overtimeRules: overtimeRules || {
        enabled: true,
        dailyOvertimeThreshold: 8,
        weeklyOvertimeThreshold: 40,
        overtimeRate: 1.5,
        doubleTimeRate: 2.0,
      },
      notes,
      createdBy: user.id,
    });

    await shift.populate([
      { path: 'organization', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return {
      message: 'Shift created successfully',
      shift,
    };
  }

  /**
   * Get overtime data for an employee
   * @param {String} employeeId - Employee ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Overtime records
   */
  async getOvertimeData(employeeId, user) {
    // Find employee
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && user.role !== 'HR Account Manager') {
      if (employee.user.toString() !== user.id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee\'s overtime data.' };
      }
    } else if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee\'s overtime data.' };
      }
    }

    const overtimeRecords = await OvertimeRecord.find({ employee: employee._id })
      .populate('attendanceRecord', 'workDate clockIn clockOut totalHours')
      .populate('employee', 'firstName lastName employee_id')
      .populate('organization', 'name')
      .sort({ overtimeDate: -1 });

    return overtimeRecords;
  }

  /**
   * Generate attendance reports
   * @param {Object} reportData - Report generation data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Generated report
   */
  async generateAttendanceReports(reportData, user) {
    const {
      reportType,
      reportName,
      description,
      reportPeriod,
      filters,
      notes,
    } = reportData;

    // Validate organization access
    let organizationId;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    } else {
      organizationId = reportData.organization;
    }

    // Generate report ID
    const reportId = Date.now() + Math.floor(Math.random() * 1000);

    // Create report record
    const report = await AttendanceReport.create({
      report_id: reportId,
      organization: organizationId,
      organization_id: reportData.organization_id,
      reportType,
      reportName,
      description,
      reportPeriod,
      filters: filters || {},
      notes,
      status: 'Generating',
      createdBy: user.id,
      generatedBy: user.id,
    });

    // Generate report data based on type
    let reportDataResult = {};
    switch (reportType) {
      case 'Daily':
        reportDataResult = await this.generateDailyReport(organizationId, reportPeriod, filters);
        break;
      case 'Weekly':
        reportDataResult = await this.generateWeeklyReport(organizationId, reportPeriod, filters);
        break;
      case 'Monthly':
        reportDataResult = await this.generateMonthlyReport(organizationId, reportPeriod, filters);
        break;
      case 'Employee Summary':
        reportDataResult = await this.generateEmployeeSummaryReport(organizationId, reportPeriod, filters);
        break;
      case 'Department Summary':
        reportDataResult = await this.generateDepartmentSummaryReport(organizationId, reportPeriod, filters);
        break;
      default:
        reportDataResult = await this.generateCustomReport(organizationId, reportPeriod, filters);
    }

    // Update report with generated data
    report.reportData = reportDataResult;
    report.status = 'Completed';
    report.generatedAt = new Date();
    report.reportUrl = `/api/attendance/reports/${reportId}/download`;
    await report.save();

    await report.populate([
      { path: 'organization', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'generatedBy', select: 'name email' },
    ]);

    return {
      message: 'Attendance report generated successfully',
      report,
    };
  }

  /**
   * Generate daily attendance report
   */
  async generateDailyReport(organizationId, reportPeriod, filters) {
    const attendanceRecords = await AttendanceRecord.find({
      organization: organizationId,
      workDate: {
        $gte: new Date(reportPeriod.startDate),
        $lte: new Date(reportPeriod.endDate),
      },
    }).populate('employee', 'firstName lastName employee_id department');

    const totalEmployees = new Set(attendanceRecords.map(record => record.employee_id)).size;
    const totalPresentDays = attendanceRecords.filter(record => record.status === 'Present').length;
    const totalAbsentDays = attendanceRecords.filter(record => record.status === 'Absent').length;
    const totalLateDays = attendanceRecords.filter(record => record.status === 'Late').length;
    const totalOvertimeHours = attendanceRecords.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
    const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);

    return {
      totalEmployees,
      totalWorkingDays: attendanceRecords.length,
      totalPresentDays,
      totalAbsentDays,
      totalLateDays,
      totalOvertimeHours,
      averageHoursPerDay: totalHours / attendanceRecords.length || 0,
      attendanceRate: (totalPresentDays / attendanceRecords.length) * 100 || 0,
    };
  }

  /**
   * Generate weekly attendance report
   */
  async generateWeeklyReport(organizationId, reportPeriod, filters) {
    // Similar to daily but grouped by week
    return await this.generateDailyReport(organizationId, reportPeriod, filters);
  }

  /**
   * Generate monthly attendance report
   */
  async generateMonthlyReport(organizationId, reportPeriod, filters) {
    // Similar to daily but grouped by month
    return await this.generateDailyReport(organizationId, reportPeriod, filters);
  }

  /**
   * Generate employee summary report
   */
  async generateEmployeeSummaryReport(organizationId, reportPeriod, filters) {
    const attendanceRecords = await AttendanceRecord.find({
      organization: organizationId,
      workDate: {
        $gte: new Date(reportPeriod.startDate),
        $lte: new Date(reportPeriod.endDate),
      },
    }).populate('employee', 'firstName lastName employee_id department');

    const employeeMap = {};
    attendanceRecords.forEach(record => {
      const empId = record.employee_id;
      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          employeeId: empId,
          employeeName: `${record.employee.firstName} ${record.employee.lastName}`,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalHours: 0,
          overtimeHours: 0,
        };
      }

      if (record.status === 'Present') employeeMap[empId].presentDays++;
      if (record.status === 'Absent') employeeMap[empId].absentDays++;
      if (record.status === 'Late') employeeMap[empId].lateDays++;
      employeeMap[empId].totalHours += record.totalHours || 0;
      employeeMap[empId].overtimeHours += record.overtimeHours || 0;
    });

    // Calculate attendance rates
    Object.values(employeeMap).forEach(emp => {
      const totalDays = emp.presentDays + emp.absentDays + emp.lateDays;
      emp.attendanceRate = totalDays > 0 ? (emp.presentDays / totalDays) * 100 : 0;
    });

    return {
      totalEmployees: Object.keys(employeeMap).length,
      employeeBreakdown: Object.values(employeeMap),
    };
  }

  /**
   * Generate department summary report
   */
  async generateDepartmentSummaryReport(organizationId, reportPeriod, filters) {
    const attendanceRecords = await AttendanceRecord.find({
      organization: organizationId,
      workDate: {
        $gte: new Date(reportPeriod.startDate),
        $lte: new Date(reportPeriod.endDate),
      },
    }).populate('employee', 'firstName lastName employee_id department');

    const departmentMap = {};
    attendanceRecords.forEach(record => {
      const dept = record.employee.department;
      if (!departmentMap[dept]) {
        departmentMap[dept] = {
          department: dept,
          employeeCount: 0,
          totalPresentDays: 0,
          totalAbsentDays: 0,
          totalLateDays: 0,
        };
      }

      if (record.status === 'Present') departmentMap[dept].totalPresentDays++;
      if (record.status === 'Absent') departmentMap[dept].totalAbsentDays++;
      if (record.status === 'Late') departmentMap[dept].totalLateDays++;
    });

    // Calculate unique employee count per department
    const deptEmployeeCount = {};
    attendanceRecords.forEach(record => {
      const dept = record.employee.department;
      if (!deptEmployeeCount[dept]) {
        deptEmployeeCount[dept] = new Set();
      }
      deptEmployeeCount[dept].add(record.employee_id);
    });

    Object.keys(departmentMap).forEach(dept => {
      departmentMap[dept].employeeCount = deptEmployeeCount[dept]?.size || 0;
      const totalDays = departmentMap[dept].totalPresentDays + departmentMap[dept].totalAbsentDays + departmentMap[dept].totalLateDays;
      departmentMap[dept].averageAttendanceRate = totalDays > 0 ? (departmentMap[dept].totalPresentDays / totalDays) * 100 : 0;
    });

    return {
      departmentBreakdown: Object.values(departmentMap),
    };
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(organizationId, reportPeriod, filters) {
    // Custom report logic based on filters
    return {
      message: 'Custom attendance report generated',
      filters,
      reportPeriod,
    };
  }

  /**
   * Get attendance records for an employee
   * @param {String} employeeId - Employee ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Attendance records
   */
  async getEmployeeAttendance(employeeId, user) {
    // Find employee
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && user.role !== 'HR Account Manager') {
      if (employee.user.toString() !== user.id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee\'s attendance records.' };
      }
    } else if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee\'s attendance records.' };
      }
    }

    const attendanceRecords = await AttendanceRecord.find({ employee: employee._id })
      .populate('employee', 'firstName lastName employee_id position department')
      .populate('organization', 'name')
      .sort({ workDate: -1 });

    return attendanceRecords;
  }

  /**
   * List all shifts
   * @param {Object} filters - Filter options
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of shifts
   */
  async listShifts(filters, user) {
    const query = {};

    // If user is not Super Admin, filter by their organization
    if (user.role !== 'Super Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.id });
      if (organization) {
        query.organization = organization._id;
      } else {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
    } else if (filters.organization) {
      query.organization = filters.organization;
    }

    // Apply filters
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.isDefault !== undefined) {
      query.isDefault = filters.isDefault;
    }

    const shifts = await Shift.find(query)
      .populate('organization', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    return shifts;
  }
}

module.exports = new AttendanceService();
