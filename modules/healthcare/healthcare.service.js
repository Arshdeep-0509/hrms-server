const {
  HealthcareRecruitment,
  HealthcareCredentials,
  HealthcareShifts,
  HealthcareShiftAssignment,
  HealthcarePolicies,
  HealthcareOnboardingWorkflow,
  HealthcareOnboardingStatus,
  HealthcareRoles,
  HealthcareAuditLogs
} = require('./healthcare.schema');
const User = require('../user/user.schema');
const Employee = require('../employee/employee.schema');
const Organization = require('../organization/organization.schema');

class HealthcareService {
  // ==================== RECRUITMENT SERVICES ====================

  async createRecruitment(recruitmentData, userId) {
    try {
      const recruitment = new HealthcareRecruitment({
        ...recruitmentData,
        hiringManager: userId
      });
      
      await recruitment.save();
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'HealthcareRecruitment', recruitment.recruitment_id, 'New healthcare recruitment created');
      
      return {
        success: true,
        message: 'Healthcare recruitment created successfully',
        recruitment: {
          recruitment_id: recruitment.recruitment_id,
          position: recruitment.position,
          department: recruitment.department,
          specialty: recruitment.specialty,
          status: recruitment.status,
          postedDate: recruitment.postedDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to create recruitment: ${error.message}`);
    }
  }

  async listRecruitments(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.status) query.status = filters.status;
      if (filters.department) query.department = filters.department;
      if (filters.specialty) query.specialty = filters.specialty;
      if (filters.priority) query.priority = filters.priority;
      
      const recruitments = await HealthcareRecruitment.find(query)
        .sort({ postedDate: -1 })
        .lean();
      
      return {
        success: true,
        recruitments,
        total: recruitments.length
      };
    } catch (error) {
      throw new Error(`Failed to list recruitments: ${error.message}`);
    }
  }

  async getRecruitmentById(recruitmentId) {
    try {
      const recruitment = await HealthcareRecruitment.findOne({ recruitment_id: recruitmentId }).lean();
      
      if (!recruitment) {
        throw new Error('Recruitment not found');
      }
      
      return {
        success: true,
        recruitment
      };
    } catch (error) {
      throw new Error(`Failed to get recruitment: ${error.message}`);
    }
  }

  async updateRecruitment(recruitmentId, updateData, userId) {
    try {
      const recruitment = await HealthcareRecruitment.findOneAndUpdate(
        { recruitment_id: recruitmentId },
        { ...updateData, updatedAt: new Date() },
        { new: true, lean: true }
      );
      
      if (!recruitment) {
        throw new Error('Recruitment not found');
      }
      
      // Log audit
      await this.logAudit(userId, 'UPDATE', 'HealthcareRecruitment', recruitmentId, 'Recruitment updated');
      
      return {
        success: true,
        message: 'Recruitment updated successfully',
        recruitment
      };
    } catch (error) {
      throw new Error(`Failed to update recruitment: ${error.message}`);
    }
  }

  async deleteRecruitment(recruitmentId, userId) {
    try {
      const recruitment = await HealthcareRecruitment.findOneAndDelete({ recruitment_id: recruitmentId });
      
      if (!recruitment) {
        throw new Error('Recruitment not found');
      }
      
      // Log audit
      await this.logAudit(userId, 'DELETE', 'HealthcareRecruitment', recruitmentId, 'Recruitment deleted');
      
      return {
        success: true,
        message: 'Recruitment deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete recruitment: ${error.message}`);
    }
  }

  // ==================== CREDENTIALS SERVICES ====================

  async addCredential(credentialData, userId) {
    try {
      const credential = new HealthcareCredentials(credentialData);
      await credential.save();
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'HealthcareCredentials', credential.credential_id, 'New credential added');
      
      return {
        success: true,
        message: 'Credential added successfully',
        credential: {
          credential_id: credential.credential_id,
          credentialType: credential.credentialType,
          credentialName: credential.credentialName,
          expirationDate: credential.expirationDate,
          status: credential.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to add credential: ${error.message}`);
    }
  }

  async listCredentials(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.credentialType) query.credentialType = filters.credentialType;
      if (filters.status) query.status = filters.status;
      if (filters.employee_id) query.employee_id = filters.employee_id;
      
      const credentials = await HealthcareCredentials.find(query)
        .sort({ expirationDate: 1 })
        .lean();
      
      // Add employee details
      for (let credential of credentials) {
        const employee = await Employee.findOne({ employee_id: credential.employee_id }).lean();
        credential.employee = employee ? {
          employee_id: employee.employee_id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email
        } : null;
      }
      
      return {
        success: true,
        credentials,
        total: credentials.length
      };
    } catch (error) {
      throw new Error(`Failed to list credentials: ${error.message}`);
    }
  }

  async renewCredential(credentialId, renewalData, userId) {
    try {
      const credential = await HealthcareCredentials.findOneAndUpdate(
        { credential_id: credentialId },
        {
          ...renewalData,
          status: 'Active',
          renewalDate: new Date(),
          lastReminderSent: null,
          updatedAt: new Date()
        },
        { new: true, lean: true }
      );
      
      if (!credential) {
        throw new Error('Credential not found');
      }
      
      // Log audit
      await this.logAudit(userId, 'UPDATE', 'HealthcareCredentials', credentialId, 'Credential renewed');
      
      return {
        success: true,
        message: 'Credential renewed successfully',
        credential
      };
    } catch (error) {
      throw new Error(`Failed to renew credential: ${error.message}`);
    }
  }

  async notifyExpiringCredentials() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringCredentials = await HealthcareCredentials.find({
        expirationDate: { $lte: thirtyDaysFromNow },
        status: 'Active',
        lastReminderSent: { $ne: new Date().toDateString() }
      }).lean();
      
      const notifications = [];
      
      for (let credential of expiringCredentials) {
        const employee = await Employee.findOne({ employee_id: credential.employee_id }).lean();
        const user = await User.findOne({ user_id: credential.employee_id }).lean();
        
        if (employee && user) {
          notifications.push({
            credential_id: credential.credential_id,
            employee_name: `${employee.firstName} ${employee.lastName}`,
            employee_email: user.email,
            credential_name: credential.credentialName,
            expiration_date: credential.expirationDate,
            days_until_expiry: Math.ceil((credential.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
          });
          
          // Update last reminder sent
          await HealthcareCredentials.updateOne(
            { credential_id: credential.credential_id },
            { lastReminderSent: new Date().toDateString() }
          );
        }
      }
      
      return {
        success: true,
        message: 'Expiring credentials notification processed',
        notifications,
        total: notifications.length
      };
    } catch (error) {
      throw new Error(`Failed to process expiring credentials: ${error.message}`);
    }
  }

  async deleteCredential(credentialId, userId) {
    try {
      const credential = await HealthcareCredentials.findOneAndDelete({ credential_id: credentialId });
      
      if (!credential) {
        throw new Error('Credential not found');
      }
      
      // Log audit
      await this.logAudit(userId, 'DELETE', 'HealthcareCredentials', credentialId, 'Credential deleted');
      
      return {
        success: true,
        message: 'Credential deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete credential: ${error.message}`);
    }
  }

  // ==================== SHIFTS SERVICES ====================

  async createShift(shiftData, userId) {
    try {
      const shift = new HealthcareShifts({
        ...shiftData,
        createdBy: userId
      });
      
      await shift.save();
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'HealthcareShifts', shift.shift_id, 'New healthcare shift created');
      
      return {
        success: true,
        message: 'Healthcare shift created successfully',
        shift: {
          shift_id: shift.shift_id,
          shiftName: shift.shiftName,
          shiftType: shift.shiftType,
          startTime: shift.startTime,
          endTime: shift.endTime,
          duration: shift.duration
        }
      };
    } catch (error) {
      throw new Error(`Failed to create shift: ${error.message}`);
    }
  }

  async assignShift(assignmentData, userId) {
    try {
      const assignment = new HealthcareShiftAssignment({
        ...assignmentData,
        assignedBy: userId
      });
      
      await assignment.save();
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'HealthcareShiftAssignment', assignment.assignment_id, 'Shift assigned to employee');
      
      return {
        success: true,
        message: 'Shift assigned successfully',
        assignment: {
          assignment_id: assignment.assignment_id,
          shift_id: assignment.shift_id,
          employee_id: assignment.employee_id,
          assignedDate: assignment.assignedDate,
          status: assignment.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to assign shift: ${error.message}`);
    }
  }

  async listShifts(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.department_id) query.department_id = filters.department_id;
      if (filters.shiftType) query.shiftType = filters.shiftType;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      
      const shifts = await HealthcareShifts.find(query)
        .sort({ createdAt: -1 })
        .lean();
      
      return {
        success: true,
        shifts,
        total: shifts.length
      };
    } catch (error) {
      throw new Error(`Failed to list shifts: ${error.message}`);
    }
  }

  async calculateShiftPayroll(assignmentId, payrollData) {
    try {
      const assignment = await HealthcareShiftAssignment.findOne({ assignment_id: assignmentId }).lean();
      
      if (!assignment) {
        throw new Error('Shift assignment not found');
      }
      
      const shift = await HealthcareShifts.findOne({ shift_id: assignment.shift_id }).lean();
      const employee = await Employee.findOne({ employee_id: assignment.employee_id }).lean();
      
      if (!shift || !employee) {
        throw new Error('Shift or employee not found');
      }
      
      const regularRate = employee.salary?.amount || 0;
      const overtimeRate = regularRate * shift.overtimeRules.overtimeRate;
      const doubleTimeRate = regularRate * shift.overtimeRules.doubleTimeRate;
      
      let regularPay = 0;
      let overtimePay = 0;
      let doubleTimePay = 0;
      
      if (assignment.actualHours <= shift.overtimeRules.dailyThreshold) {
        regularPay = assignment.actualHours * regularRate;
      } else {
        regularPay = shift.overtimeRules.dailyThreshold * regularRate;
        const overtimeHours = assignment.actualHours - shift.overtimeRules.dailyThreshold;
        
        if (overtimeHours <= 4) {
          overtimePay = overtimeHours * overtimeRate;
        } else {
          overtimePay = 4 * overtimeRate;
          doubleTimePay = (overtimeHours - 4) * doubleTimeRate;
        }
      }
      
      const totalPay = regularPay + overtimePay + doubleTimePay;
      
      // Update assignment with payroll data
      await HealthcareShiftAssignment.updateOne(
        { assignment_id: assignmentId },
        {
          payrollCalculated: true,
          payrollAmount: totalPay,
          isOvertime: assignment.actualHours > shift.overtimeRules.dailyThreshold
        }
      );
      
      return {
        success: true,
        message: 'Shift payroll calculated successfully',
        payroll: {
          assignment_id: assignmentId,
          employee_id: assignment.employee_id,
          regularHours: Math.min(assignment.actualHours, shift.overtimeRules.dailyThreshold),
          overtimeHours: Math.max(0, assignment.actualHours - shift.overtimeRules.dailyThreshold),
          regularPay,
          overtimePay,
          doubleTimePay,
          totalPay,
          currency: employee.salary?.currency || 'USD'
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate shift payroll: ${error.message}`);
    }
  }

  async getShiftLogs(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.employee_id) query.employee_id = filters.employee_id;
      if (filters.status) query.status = filters.status;
      if (filters.startDate) query.assignedDate = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query.assignedDate = {
          ...query.assignedDate,
          $lte: new Date(filters.endDate)
        };
      }
      
      const assignments = await HealthcareShiftAssignment.find(query)
        .sort({ assignedDate: -1 })
        .lean();
      
      // Add employee and shift details
      for (let assignment of assignments) {
        const employee = await Employee.findOne({ employee_id: assignment.employee_id }).lean();
        const shift = await HealthcareShifts.findOne({ shift_id: assignment.shift_id }).lean();
        
        assignment.employee = employee ? {
          employee_id: employee.employee_id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email
        } : null;
        
        assignment.shift = shift ? {
          shift_id: shift.shift_id,
          shiftName: shift.shiftName,
          shiftType: shift.shiftType
        } : null;
      }
      
      return {
        success: true,
        assignments,
        total: assignments.length
      };
    } catch (error) {
      throw new Error(`Failed to get shift logs: ${error.message}`);
    }
  }

  // ==================== POLICIES SERVICES ====================

  async uploadPolicy(policyData, userId) {
    try {
      const policy = new HealthcarePolicies({
        ...policyData,
        createdBy: userId
      });
      
      await policy.save();
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'HealthcarePolicies', policy.policy_id, 'New healthcare policy uploaded');
      
      return {
        success: true,
        message: 'Healthcare policy uploaded successfully',
        policy: {
          policy_id: policy.policy_id,
          policyName: policy.policyName,
          policyType: policy.policyType,
          version: policy.version,
          status: policy.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload policy: ${error.message}`);
    }
  }

  async listPolicies(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.policyType) query.policyType = filters.policyType;
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      
      const policies = await HealthcarePolicies.find(query)
        .sort({ effectiveDate: -1 })
        .lean();
      
      return {
        success: true,
        policies,
        total: policies.length
      };
    } catch (error) {
      throw new Error(`Failed to list policies: ${error.message}`);
    }
  }

  // ==================== ONBOARDING SERVICES ====================

  async createOnboardingWorkflow(workflowData, userId) {
    try {
      const workflow = new HealthcareOnboardingWorkflow({
        ...workflowData,
        createdBy: userId
      });
      
      await workflow.save();
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'HealthcareOnboardingWorkflow', workflow.workflow_id, 'New onboarding workflow created');
      
      return {
        success: true,
        message: 'Onboarding workflow created successfully',
        workflow: {
          workflow_id: workflow.workflow_id,
          workflowName: workflow.workflowName,
          department: workflow.department,
          position: workflow.position,
          totalEstimatedDays: workflow.totalEstimatedDays
        }
      };
    } catch (error) {
      throw new Error(`Failed to create onboarding workflow: ${error.message}`);
    }
  }

  async getOnboardingStatus(employeeId) {
    try {
      const status = await HealthcareOnboardingStatus.findOne({ employee_id: employeeId })
        .populate('workflow_id')
        .lean();
      
      if (!status) {
        throw new Error('Onboarding status not found');
      }
      
      // Get workflow details
      const workflow = await HealthcareOnboardingWorkflow.findOne({ workflow_id: status.workflow_id }).lean();
      
      return {
        success: true,
        status: {
          ...status,
          workflow: workflow
        }
      };
    } catch (error) {
      throw new Error(`Failed to get onboarding status: ${error.message}`);
    }
  }

  // ==================== ROLES SERVICES ====================

  async createHealthcareRole(roleData, userId) {
    try {
      const role = new HealthcareRoles({
        ...roleData,
        createdBy: userId
      });
      
      await role.save();
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'HealthcareRoles', role.role_id, 'New healthcare role created');
      
      return {
        success: true,
        message: 'Healthcare role created successfully',
        role: {
          role_id: role.role_id,
          roleName: role.roleName,
          roleType: role.roleType,
          department: role.department
        }
      };
    } catch (error) {
      throw new Error(`Failed to create healthcare role: ${error.message}`);
    }
  }

  async assignHealthcareRole(assignmentData, userId) {
    try {
      // This would typically involve updating user roles or creating role assignments
      // For now, we'll log the assignment
      
      // Log audit
      await this.logAudit(userId, 'CREATE', 'RoleAssignment', assignmentData.employee_id, 'Healthcare role assigned to employee');
      
      return {
        success: true,
        message: 'Healthcare role assigned successfully',
        assignment: assignmentData
      };
    } catch (error) {
      throw new Error(`Failed to assign healthcare role: ${error.message}`);
    }
  }

  // ==================== AUDIT SERVICES ====================

  async getAuditLogs(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.category) query.category = filters.category;
      if (filters.severity) query.severity = filters.severity;
      if (filters.user_id) query.user_id = filters.user_id;
      if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query.timestamp = {
          ...query.timestamp,
          $lte: new Date(filters.endDate)
        };
      }
      
      const auditLogs = await HealthcareAuditLogs.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100)
        .lean();
      
      // Add user details
      for (let log of auditLogs) {
        const user = await User.findOne({ user_id: log.user_id }).lean();
        log.user = user ? {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null;
      }
      
      return {
        success: true,
        auditLogs,
        total: auditLogs.length
      };
    } catch (error) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }
  }

  async exportAuditLogs(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.category) query.category = filters.category;
      if (filters.severity) query.severity = filters.severity;
      if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query.timestamp = {
          ...query.timestamp,
          $lte: new Date(filters.endDate)
        };
      }
      
      const auditLogs = await HealthcareAuditLogs.find(query)
        .sort({ timestamp: -1 })
        .lean();
      
      // Add user details
      for (let log of auditLogs) {
        const user = await User.findOne({ user_id: log.user_id }).lean();
        log.user = user ? {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null;
      }
      
      return {
        success: true,
        message: 'Audit logs exported successfully',
        auditLogs,
        total: auditLogs.length,
        exportDate: new Date(),
        format: filters.format || 'JSON'
      };
    } catch (error) {
      throw new Error(`Failed to export audit logs: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  async logAudit(userId, action, resource, resourceId, details, category = 'Other') {
    try {
      const auditLog = new HealthcareAuditLogs({
        user_id: userId,
        action,
        resource,
        resourceId: resourceId.toString(),
        details,
        category,
        timestamp: new Date()
      });
      
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log audit:', error.message);
    }
  }
}

module.exports = new HealthcareService();
