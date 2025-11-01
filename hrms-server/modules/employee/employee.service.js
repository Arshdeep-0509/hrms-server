const Employee = require('./employee.schema');
const Organization = require('../organization/organization.schema');
const User = require('../user/user.schema');

class EmployeeService {
  /**
   * List all employees with filters
   * @param {Object} filters - Filter options (department, employmentStatus, role, search)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of employees
   */
  async listEmployees(filters, user) {
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
    if (filters.department) {
      query.department = filters.department;
    }

    if (filters.employmentStatus) {
      query.employmentStatus = filters.employmentStatus;
    }

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { position: { $regex: filters.search, $options: 'i' } },
        { employee_id: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query)
      .populate('user', 'name email')
      .populate('organization', 'name')
      .populate('role', 'name')
      .populate('manager', 'firstName lastName email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    return employees;
  }

  /**
   * Get employee by ID
   * @param {String} employeeId - Employee ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Employee details
   */
  async getEmployeeById(employeeId, user) {
    // Try to find by employee_id first (numeric), then fall back to ObjectId
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check - User can access their own profile
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin') {
      if (employee.user.toString() !== user.id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee profile.' };
      }
    } else if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee.' };
      }
    }

    await employee.populate([
      { path: 'user', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'role', select: 'name' },
      { path: 'manager', select: 'firstName lastName email employee_id' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' },
      { path: 'documents.uploadedBy', select: 'name email' },
    ]);

    return employee;
  }

  /**
   * Create new employee
   * @param {Object} employeeData - Employee data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created employee
   */
  async createEmployee(employeeData, user) {
    const {
      user: userId,
      user_id,
      organization,
      organization_id,
      role,
      role_id,
      employee_id,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      position,
      department,
      department_id,
      employmentType,
      hireDate,
      salary,
      benefits,
      workLocation,
      manager,
      manager_id,
    } = employeeData;

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

    // Check if employee with same email already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      throw { statusCode: 400, message: 'Employee with this email already exists.' };
    }

    // Check if employee_id already exists
    const existingEmployeeId = await Employee.findOne({ employee_id });
    if (existingEmployeeId) {
      throw { statusCode: 400, message: 'Employee ID already exists.' };
    }

    const employee = await Employee.create({
      user: userId,
      user_id,
      organization: organizationId,
      organization_id,
      role,
      role_id,
      employee_id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      position,
      department,
      department_id,
      employmentType,
      hireDate,
      salary,
      benefits: benefits || [],
      workLocation,
      manager,
      manager_id,
      createdBy: user.id,
      statusHistory: [{
        status: 'Active',
        changedAt: new Date(),
        changedBy: user.id,
        notes: 'Employee created',
      }],
    });

    await employee.populate([
      { path: 'user', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'role', select: 'name' },
      { path: 'manager', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return {
      message: 'Employee created successfully',
      employee,
    };
  }

  /**
   * Update employee details
   * @param {String} employeeId - Employee ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated employee
   */
  async updateEmployee(employeeId, updateData, user) {
    // Try to find by employee_id first (numeric), then fall back to ObjectId
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee.' };
      }
    }

    // Update allowed fields
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'dateOfBirth',
      'gender',
      'address',
      'emergencyContact',
      'position',
      'department',
      'department_id',
      'employmentType',
      'salary',
      'benefits',
      'workLocation',
      'manager',
      'manager_id',
      'notes',
      'tags',
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        employee[field] = updateData[field];
      }
    });

    employee.updatedBy = user.id;
    await employee.save();

    await employee.populate([
      { path: 'user', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'role', select: 'name' },
      { path: 'manager', select: 'firstName lastName email' },
      { path: 'updatedBy', select: 'name email' },
    ]);

    return {
      message: 'Employee updated successfully',
      employee,
    };
  }

  /**
   * Update employee status (activate/deactivate/terminate)
   * @param {String} employeeId - Employee ID
   * @param {Object} statusData - Status update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated employee
   */
  async updateEmployeeStatus(employeeId, statusData, user) {
    // Try to find by employee_id first (numeric), then fall back to ObjectId
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee.' };
      }
    }

    const { employmentStatus, terminationDate, terminationReason, terminationNotes, notes } = statusData;

    // Update status
    employee.employmentStatus = employmentStatus;

    if (employmentStatus === 'Terminated' || employmentStatus === 'Resigned') {
      employee.terminationDate = terminationDate || new Date();
      employee.terminationReason = terminationReason;
      employee.terminationNotes = terminationNotes;
    }

    // Add to status history
    employee.statusHistory.push({
      status: employmentStatus,
      changedAt: new Date(),
      changedBy: user.id,
      notes: notes || 'Status updated',
    });

    employee.updatedBy = user.id;
    await employee.save();

    await employee.populate([
      { path: 'user', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'updatedBy', select: 'name email' },
    ]);

    return {
      message: 'Employee status updated successfully',
      employee,
    };
  }

  /**
   * Upload document for employee
   * @param {String} employeeId - Employee ID
   * @param {Object} documentData - Document data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated employee with new document
   */
  async uploadDocument(employeeId, documentData, user) {
    // Try to find by employee_id first (numeric), then fall back to ObjectId
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee.' };
      }
    }

    const { type, name, url } = documentData;

    // Add document
    employee.documents.push({
      type,
      name,
      url,
      uploadedBy: user.id,
    });

    employee.updatedBy = user.id;
    await employee.save();

    await employee.populate([
      { path: 'user', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'documents.uploadedBy', select: 'name email' },
    ]);

    return {
      message: 'Document uploaded successfully',
      employee,
    };
  }

  /**
   * Trigger onboarding workflow
   * @param {String} employeeId - Employee ID
   * @param {Object} onboardingData - Onboarding data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated employee with onboarding started
   */
  async startOnboarding(employeeId, onboardingData, user) {
    // Try to find by employee_id first (numeric), then fall back to ObjectId
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee.' };
      }
    }

    const { onboardingTasks } = onboardingData;

    // Start onboarding
    employee.onboardingStatus = 'In Progress';
    employee.onboardingStartDate = new Date();

    if (onboardingTasks && onboardingTasks.length > 0) {
      employee.onboardingTasks = onboardingTasks;
    }

    employee.updatedBy = user.id;
    await employee.save();

    await employee.populate([
      { path: 'user', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'onboardingTasks.assignedTo', select: 'name email' },
    ]);

    return {
      message: 'Onboarding workflow started successfully',
      employee,
    };
  }

  /**
   * Trigger offboarding workflow
   * @param {String} employeeId - Employee ID
   * @param {Object} offboardingData - Offboarding data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated employee with offboarding started
   */
  async startOffboarding(employeeId, offboardingData, user) {
    // Try to find by employee_id first (numeric), then fall back to ObjectId
    let employee = await Employee.findOne({ employee_id: parseInt(employeeId) });
    if (!employee) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || employee.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this employee.' };
      }
    }

    const { offboardingTasks } = offboardingData;

    // Start offboarding
    employee.offboardingStatus = 'In Progress';
    employee.offboardingStartDate = new Date();

    if (offboardingTasks && offboardingTasks.length > 0) {
      employee.offboardingTasks = offboardingTasks;
    }

    employee.updatedBy = user.id;
    await employee.save();

    await employee.populate([
      { path: 'user', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'offboardingTasks.assignedTo', select: 'name email' },
    ]);

    return {
      message: 'Offboarding workflow started successfully',
      employee,
    };
  }
}

module.exports = new EmployeeService();
