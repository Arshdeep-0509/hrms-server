const { PayrollCycle, Payslip, PayrollTax, PayrollReport } = require('./payroll.schema');
const Employee = require('../employee/employee.schema');
const Organization = require('../organization/organization.schema');
const User = require('../user/user.schema');

class PayrollService {
  /**
   * List all payroll cycles with filters
   * @param {Object} filters - Filter options (status, organization, dateRange)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of payroll cycles
   */
  async listPayrollCycles(filters, user) {
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
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.cycleType) {
      query.cycleType = filters.cycleType;
    }

    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        query['payPeriod.startDate'] = { $gte: new Date(filters.dateRange.startDate) };
      }
      if (filters.dateRange.endDate) {
        query['payPeriod.endDate'] = { $lte: new Date(filters.dateRange.endDate) };
      }
    }

    const cycles = await PayrollCycle.find(query)
      .populate('organization', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    return cycles;
  }

  /**
   * Get payroll cycle by ID
   * @param {String} cycleId - Cycle ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Payroll cycle details
   */
  async getPayrollCycleById(cycleId, user) {
    // Try to find by cycle_id first (numeric), then fall back to ObjectId
    let cycle = await PayrollCycle.findOne({ cycle_id: parseInt(cycleId) });
    if (!cycle) {
      cycle = await PayrollCycle.findById(cycleId);
    }

    if (!cycle) {
      throw { statusCode: 404, message: 'Payroll cycle not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || cycle.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this payroll cycle.' };
      }
    }

    await cycle.populate([
      { path: 'organization', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' },
      { path: 'processedBy', select: 'name email' },
    ]);

    return cycle;
  }

  /**
   * Create new payroll cycle
   * @param {Object} cycleData - Payroll cycle data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created payroll cycle
   */
  async createPayrollCycle(cycleData, user) {
    const {
      organization,
      organization_id,
      name,
      description,
      payPeriod,
      payDate,
      cycleType,
      notes,
    } = cycleData;

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

    // Check if cycle_id already exists
    const existingCycleId = await PayrollCycle.findOne({ cycle_id: cycleData.cycle_id });
    if (existingCycleId) {
      throw { statusCode: 400, message: 'Cycle ID already exists.' };
    }

    const cycle = await PayrollCycle.create({
      cycle_id: cycleData.cycle_id,
      organization: organizationId,
      organization_id,
      name,
      description,
      payPeriod,
      payDate,
      cycleType,
      notes,
      createdBy: user.id,
    });

    await cycle.populate([
      { path: 'organization', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return {
      message: 'Payroll cycle created successfully',
      cycle,
    };
  }

  /**
   * Update payroll cycle
   * @param {String} cycleId - Cycle ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated payroll cycle
   */
  async updatePayrollCycle(cycleId, updateData, user) {
    // Try to find by cycle_id first (numeric), then fall back to ObjectId
    let cycle = await PayrollCycle.findOne({ cycle_id: parseInt(cycleId) });
    if (!cycle) {
      cycle = await PayrollCycle.findById(cycleId);
    }

    if (!cycle) {
      throw { statusCode: 404, message: 'Payroll cycle not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || cycle.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this payroll cycle.' };
      }
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'description',
      'payPeriod',
      'payDate',
      'cycleType',
      'notes',
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        cycle[field] = updateData[field];
      }
    });

    cycle.updatedBy = user.id;
    await cycle.save();

    await cycle.populate([
      { path: 'organization', select: 'name' },
      { path: 'updatedBy', select: 'name email' },
    ]);

    return {
      message: 'Payroll cycle updated successfully',
      cycle,
    };
  }

  /**
   * Process payroll for employees
   * @param {Object} payrollData - Payroll processing data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Payroll processing result
   */
  async processPayroll(payrollData, user) {
    const { cycleId, employeeIds, payPeriod, payDate } = payrollData;

    // Get payroll cycle
    let cycle = await PayrollCycle.findOne({ cycle_id: parseInt(cycleId) });
    if (!cycle) {
      cycle = await PayrollCycle.findById(cycleId);
    }

    if (!cycle) {
      throw { statusCode: 404, message: 'Payroll cycle not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || cycle.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this payroll cycle.' };
      }
    }

    // Get employees to process
    let employees;
    if (employeeIds && employeeIds.length > 0) {
      employees = await Employee.find({
        employee_id: { $in: employeeIds },
        organization: cycle.organization,
        employmentStatus: 'Active',
      });
    } else {
      employees = await Employee.find({
        organization: cycle.organization,
        employmentStatus: 'Active',
      });
    }

    if (employees.length === 0) {
      throw { statusCode: 400, message: 'No active employees found for payroll processing.' };
    }

    // Update cycle status
    cycle.status = 'In Progress';
    cycle.processedBy = user.id;
    cycle.processedAt = new Date();
    await cycle.save();

    const processedPayslips = [];
    let totalGrossPay = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;

    // Process each employee
    for (const employee of employees) {
      const payslip = await this.generatePayslip(employee, cycle, payPeriod, payDate, user);
      processedPayslips.push(payslip);

      totalGrossPay += payslip.earnings.totalEarnings;
      totalDeductions += payslip.deductions.totalDeductions;
      totalNetPay += payslip.netPay;
    }

    // Update cycle totals
    cycle.totalEmployees = employees.length;
    cycle.totalGrossPay = totalGrossPay;
    cycle.totalDeductions = totalDeductions;
    cycle.totalNetPay = totalNetPay;
    cycle.status = 'Completed';
    await cycle.save();

    return {
      message: 'Payroll processed successfully',
      cycle,
      processedPayslips,
      summary: {
        totalEmployees: employees.length,
        totalGrossPay,
        totalDeductions,
        totalNetPay,
      },
    };
  }

  /**
   * Generate payslip for an employee
   * @param {Object} employee - Employee data
   * @param {Object} cycle - Payroll cycle
   * @param {Object} payPeriod - Pay period
   * @param {Date} payDate - Pay date
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Generated payslip
   */
  async generatePayslip(employee, cycle, payPeriod, payDate, user) {
    // Calculate earnings
    const basicSalary = employee.salary?.amount || 0;
    const allowances = [
      { name: 'House Rent Allowance', amount: basicSalary * 0.1, taxable: true },
      { name: 'Transport Allowance', amount: basicSalary * 0.05, taxable: true },
    ];
    const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
    const totalEarnings = basicSalary + totalAllowances;

    // Calculate deductions
    const incomeTax = totalEarnings * 0.1; // 10% tax
    const socialSecurity = totalEarnings * 0.05; // 5% social security
    const healthInsurance = 500; // Fixed amount
    const totalDeductions = incomeTax + socialSecurity + healthInsurance;

    const netPay = totalEarnings - totalDeductions;

    // Generate payslip ID
    const payslipId = Date.now() + Math.floor(Math.random() * 1000);

    const payslip = await Payslip.create({
      payslip_id: payslipId,
      employee: employee._id,
      employee_id: employee.employee_id,
      organization: employee.organization,
      organization_id: employee.organization_id,
      payrollCycle: cycle._id,
      cycle_id: cycle.cycle_id,
      employeeDetails: {
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employee_id,
        position: employee.position,
        department: employee.department,
        hireDate: employee.hireDate,
      },
      payPeriod,
      payDate,
      earnings: {
        basicSalary,
        allowances,
        totalEarnings,
      },
      deductions: {
        incomeTax,
        socialSecurity,
        healthInsurance,
        totalDeductions,
      },
      netPay,
      taxInformation: {
        taxYear: new Date().getFullYear(),
        taxableIncome: totalEarnings,
      },
      createdBy: user.id,
    });

    return payslip;
  }

  /**
   * Get payslips for an employee
   * @param {String} employeeId - Employee ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of payslips
   */
  async getEmployeePayslips(employeeId, user) {
    // Find employee
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check - Employee can access their own payslips
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && user.role !== 'Payroll Specialist') {
      if (employee.user.toString() !== user.id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee\'s payslips.' };
      }
    } else if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee\'s payslips.' };
      }
    }

    const payslips = await Payslip.find({ employee: employee._id })
      .populate('payrollCycle', 'name cycleType payPeriod')
      .populate('organization', 'name')
      .sort({ payDate: -1 });

    return payslips;
  }

  /**
   * List payroll tax details
   * @param {Object} filters - Filter options
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of payroll taxes
   */
  async listPayrollTaxes(filters, user) {
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
    if (filters.taxYear) {
      query.taxYear = filters.taxYear;
    }

    if (filters.taxType) {
      query.taxType = filters.taxType;
    }

    if (filters.filingStatus) {
      query.filingStatus = filters.filingStatus;
    }

    const taxes = await PayrollTax.find(query)
      .populate('organization', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('filedBy', 'name email')
      .sort({ createdAt: -1 });

    return taxes;
  }

  /**
   * File tax reports
   * @param {Object} taxData - Tax filing data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Tax filing result
   */
  async fileTaxReports(taxData, user) {
    const { taxId, filingReference, notes } = taxData;

    // Find tax record
    let tax = await PayrollTax.findOne({ tax_id: parseInt(taxId) });
    if (!tax) {
      tax = await PayrollTax.findById(taxId);
    }

    if (!tax) {
      throw { statusCode: 404, message: 'Tax record not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || tax.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this tax record.' };
      }
    }

    // Update tax filing status
    tax.filingStatus = 'Filed';
    tax.filedDate = new Date();
    tax.filingReference = filingReference;
    tax.filedBy = user.id;
    if (notes) {
      tax.notes = notes;
    }

    await tax.save();

    await tax.populate([
      { path: 'organization', select: 'name' },
      { path: 'filedBy', select: 'name email' },
    ]);

    return {
      message: 'Tax report filed successfully',
      tax,
    };
  }

  /**
   * Generate payroll reports
   * @param {Object} reportData - Report generation data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Generated report
   */
  async generatePayrollReports(reportData, user) {
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
    const report = await PayrollReport.create({
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
      case 'Payroll Summary':
        reportDataResult = await this.generatePayrollSummaryReport(organizationId, reportPeriod, filters);
        break;
      case 'Tax Report':
        reportDataResult = await this.generateTaxReport(organizationId, reportPeriod, filters);
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
    report.reportUrl = `/api/payroll/reports/${reportId}/download`; // Mock URL
    await report.save();

    await report.populate([
      { path: 'organization', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'generatedBy', select: 'name email' },
    ]);

    return {
      message: 'Payroll report generated successfully',
      report,
    };
  }

  /**
   * Generate payroll summary report
   */
  async generatePayrollSummaryReport(organizationId, reportPeriod, filters) {
    const payslips = await Payslip.find({
      organization: organizationId,
      payDate: {
        $gte: new Date(reportPeriod.startDate),
        $lte: new Date(reportPeriod.endDate),
      },
    });

    const totalEmployees = payslips.length;
    const totalGrossPay = payslips.reduce((sum, payslip) => sum + payslip.earnings.totalEarnings, 0);
    const totalDeductions = payslips.reduce((sum, payslip) => sum + payslip.deductions.totalDeductions, 0);
    const totalNetPay = payslips.reduce((sum, payslip) => sum + payslip.netPay, 0);

    return {
      totalEmployees,
      totalGrossPay,
      totalDeductions,
      totalNetPay,
      totalTaxes: totalDeductions,
    };
  }

  /**
   * Generate tax report
   */
  async generateTaxReport(organizationId, reportPeriod, filters) {
    const taxes = await PayrollTax.find({
      organization: organizationId,
      taxPeriod: {
        startDate: { $gte: new Date(reportPeriod.startDate) },
        endDate: { $lte: new Date(reportPeriod.endDate) },
      },
    });

    return {
      totalTaxRecords: taxes.length,
      totalTaxAmount: taxes.reduce((sum, tax) => sum + tax.totalTaxAmount, 0),
      taxes,
    };
  }

  /**
   * Generate employee summary report
   */
  async generateEmployeeSummaryReport(organizationId, reportPeriod, filters) {
    const payslips = await Payslip.find({
      organization: organizationId,
      payDate: {
        $gte: new Date(reportPeriod.startDate),
        $lte: new Date(reportPeriod.endDate),
      },
    }).populate('employee', 'firstName lastName employee_id');

    const employeeBreakdown = payslips.map(payslip => ({
      employeeId: payslip.employee_id,
      employeeName: payslip.employeeDetails.name,
      grossPay: payslip.earnings.totalEarnings,
      deductions: payslip.deductions.totalDeductions,
      netPay: payslip.netPay,
    }));

    return {
      totalEmployees: employeeBreakdown.length,
      employeeBreakdown,
    };
  }

  /**
   * Generate department summary report
   */
  async generateDepartmentSummaryReport(organizationId, reportPeriod, filters) {
    const payslips = await Payslip.find({
      organization: organizationId,
      payDate: {
        $gte: new Date(reportPeriod.startDate),
        $lte: new Date(reportPeriod.endDate),
      },
    });

    const departmentMap = {};
    payslips.forEach(payslip => {
      const dept = payslip.employeeDetails.department;
      if (!departmentMap[dept]) {
        departmentMap[dept] = {
          department: dept,
          employeeCount: 0,
          totalPay: 0,
        };
      }
      departmentMap[dept].employeeCount++;
      departmentMap[dept].totalPay += payslip.netPay;
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
      message: 'Custom report generated',
      filters,
      reportPeriod,
    };
  }
}

module.exports = new PayrollService();
