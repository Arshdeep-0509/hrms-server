const { Healthcare } = require('./healthcare.schema');
const User = require('../user/user.schema');
const Employee = require('../employee/employee.schema');

class HealthcareService {
  // ==================== RECRUITMENT SERVICES ====================

  async createRecruitment(recruitmentData, userId) {
    try {
      const healthcare = new Healthcare({
        entityType: 'Recruitment',
        organization_id: recruitmentData.organization_id,
        recruitment: {
          ...recruitmentData,
          hiringManager: userId
        },
        createdBy: userId
      });
      
      await healthcare.save();
      
      await this.logAudit(userId, 'CREATE', 'HealthcareRecruitment', healthcare.healthcare_id, 'New healthcare recruitment created');
      
      return {
        success: true,
        message: 'Healthcare recruitment created successfully',
        recruitment: {
          recruitment_id: healthcare.healthcare_id,
          position: healthcare.recruitment.position,
          department: healthcare.recruitment.department,
          specialty: healthcare.recruitment.specialty,
          status: healthcare.recruitment.status,
          postedDate: healthcare.recruitment.postedDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to create recruitment: ${error.message}`);
    }
  }

  async listRecruitments(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId, entityType: 'Recruitment' };
      
      if (filters.status) query['recruitment.status'] = filters.status;
      if (filters.department) query['recruitment.department'] = filters.department;
      if (filters.specialty) query['recruitment.specialty'] = filters.specialty;
      if (filters.priority) query['recruitment.priority'] = filters.priority;
      
      const records = await Healthcare.find(query).sort({ 'recruitment.postedDate': -1 }).lean();
      
      const recruitments = records.map(r => ({
        recruitment_id: r.healthcare_id,
        ...r.recruitment
      }));
      
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
      const healthcare = await Healthcare.findOne({ healthcare_id: recruitmentId, entityType: 'Recruitment' }).lean();
      
      if (!healthcare) {
        throw new Error('Recruitment not found');
      }
      
      return {
        success: true,
        recruitment: {
          recruitment_id: healthcare.healthcare_id,
          ...healthcare.recruitment
        }
      };
    } catch (error) {
      throw new Error(`Failed to get recruitment: ${error.message}`);
    }
  }

  async updateRecruitment(recruitmentId, updateData, userId) {
    try {
      const updateObj = {};
      Object.keys(updateData).forEach(key => {
        if (key !== 'organization_id') {
          updateObj[`recruitment.${key}`] = updateData[key];
        }
      });
      
      const healthcare = await Healthcare.findOneAndUpdate(
        { healthcare_id: recruitmentId, entityType: 'Recruitment' },
        { ...updateObj, updatedAt: new Date() },
        { new: true, lean: true }
      );
      
      if (!healthcare) {
        throw new Error('Recruitment not found');
      }
      
      await this.logAudit(userId, 'UPDATE', 'HealthcareRecruitment', recruitmentId, 'Recruitment updated');
      
      return {
        success: true,
        message: 'Recruitment updated successfully',
        recruitment: {
          recruitment_id: healthcare.healthcare_id,
          ...healthcare.recruitment
        }
      };
    } catch (error) {
      throw new Error(`Failed to update recruitment: ${error.message}`);
    }
  }

  async deleteRecruitment(recruitmentId, userId) {
    try {
      const healthcare = await Healthcare.findOneAndDelete({ healthcare_id: recruitmentId, entityType: 'Recruitment' });
      
      if (!healthcare) {
        throw new Error('Recruitment not found');
      }
      
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
      const healthcare = new Healthcare({
        entityType: 'Credential',
        organization_id: credentialData.organization_id,
        credential: credentialData,
        createdBy: userId
      });
      
      await healthcare.save();
      
      await this.logAudit(userId, 'CREATE', 'HealthcareCredentials', healthcare.healthcare_id, 'New credential added');
      
      return {
        success: true,
        message: 'Credential added successfully',
        credential: {
          credential_id: healthcare.healthcare_id,
          credentialType: healthcare.credential.credentialType,
          credentialName: healthcare.credential.credentialName,
          expirationDate: healthcare.credential.expirationDate,
          status: healthcare.credential.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to add credential: ${error.message}`);
    }
  }

  async listCredentials(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId, entityType: 'Credential' };
      
      if (filters.credentialType) query['credential.credentialType'] = filters.credentialType;
      if (filters.status) query['credential.status'] = filters.status;
      if (filters.employee_id) query['credential.employee_id'] = filters.employee_id;
      
      const records = await Healthcare.find(query).sort({ 'credential.expirationDate': 1 }).lean();
      
      const credentials = [];
      for (let record of records) {
        const cred = {
          credential_id: record.healthcare_id,
          ...record.credential
        };
        
        if (record.credential.employee_id) {
          const employee = await Employee.findOne({ employee_id: record.credential.employee_id }).lean();
          cred.employee = employee ? {
            employee_id: employee.employee_id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email
          } : null;
        }
        
        credentials.push(cred);
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
      const updateObj = {};
      Object.keys(renewalData).forEach(key => {
        updateObj[`credential.${key}`] = renewalData[key];
      });
      
      updateObj['credential.status'] = 'Active';
      updateObj['credential.renewalDate'] = new Date();
      updateObj['credential.lastReminderSent'] = null;
      
      const healthcare = await Healthcare.findOneAndUpdate(
        { healthcare_id: credentialId, entityType: 'Credential' },
        { ...updateObj, updatedAt: new Date() },
        { new: true, lean: true }
      );
      
      if (!healthcare) {
        throw new Error('Credential not found');
      }
      
      await this.logAudit(userId, 'UPDATE', 'HealthcareCredentials', credentialId, 'Credential renewed');
      
      return {
        success: true,
        message: 'Credential renewed successfully',
        credential: {
          credential_id: healthcare.healthcare_id,
          ...healthcare.credential
        }
      };
    } catch (error) {
      throw new Error(`Failed to renew credential: ${error.message}`);
    }
  }

  async notifyExpiringCredentials() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const records = await Healthcare.find({
        entityType: 'Credential',
        'credential.expirationDate': { $lte: thirtyDaysFromNow },
        'credential.status': 'Active',
        'credential.lastReminderSent': { $ne: new Date().toDateString() }
      }).lean();
      
      const notifications = [];
      
      for (let record of records) {
        const employee = await Employee.findOne({ employee_id: record.credential.employee_id }).lean();
        const user = await User.findOne({ user_id: record.credential.employee_id }).lean();
        
        if (employee && user) {
          notifications.push({
            credential_id: record.healthcare_id,
            employee_name: `${employee.firstName} ${employee.lastName}`,
            employee_email: user.email,
            credential_name: record.credential.credentialName,
            expiration_date: record.credential.expirationDate,
            days_until_expiry: Math.ceil((record.credential.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
          });
          
          await Healthcare.updateOne(
            { healthcare_id: record.healthcare_id },
            { 'credential.lastReminderSent': new Date().toDateString() }
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
      const healthcare = await Healthcare.findOneAndDelete({ healthcare_id: credentialId, entityType: 'Credential' });
      
      if (!healthcare) {
        throw new Error('Credential not found');
      }
      
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
      const healthcare = new Healthcare({
        entityType: 'Shift',
        organization_id: shiftData.organization_id,
        shift: {
          ...shiftData,
          assignments: []
        },
        createdBy: userId
      });
      
      await healthcare.save();
      
      await this.logAudit(userId, 'CREATE', 'HealthcareShifts', healthcare.healthcare_id, 'New healthcare shift created');
      
      return {
        success: true,
        message: 'Healthcare shift created successfully',
        shift: {
          shift_id: healthcare.healthcare_id,
          shiftName: healthcare.shift.shiftName,
          shiftType: healthcare.shift.shiftType,
          startTime: healthcare.shift.startTime,
          endTime: healthcare.shift.endTime,
          duration: healthcare.shift.duration
        }
      };
    } catch (error) {
      throw new Error(`Failed to create shift: ${error.message}`);
    }
  }

  async assignShift(assignmentData, userId) {
    try {
      const { shift_id, ...assignment } = assignmentData;
      
      const assignmentEntry = {
        ...assignment,
        assignedBy: userId
      };
      
      await Healthcare.updateOne(
        { healthcare_id: shift_id, entityType: 'Shift' },
        { $push: { 'shift.assignments': assignmentEntry }, updatedAt: new Date() }
      );
      
      await this.logAudit(userId, 'CREATE', 'HealthcareShiftAssignment', shift_id, 'Shift assigned to employee');
      
      return {
        success: true,
        message: 'Shift assigned successfully',
        assignment: {
          shift_id: shift_id,
          employee_id: assignment.employee_id,
          assignedDate: assignment.assignedDate,
          status: assignment.status || 'Scheduled'
        }
      };
    } catch (error) {
      throw new Error(`Failed to assign shift: ${error.message}`);
    }
  }

  async listShifts(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId, entityType: 'Shift' };
      
      if (filters.department_id) query['shift.department_id'] = filters.department_id;
      if (filters.shiftType) query['shift.shiftType'] = filters.shiftType;
      if (filters.isActive !== undefined) query['shift.isActive'] = filters.isActive;
      
      const records = await Healthcare.find(query).sort({ createdAt: -1 }).lean();
      
      const shifts = records.map(r => ({
        shift_id: r.healthcare_id,
        ...r.shift
      }));
      
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
      // Find the shift assignment
      const healthcare = await Healthcare.findOne({
        entityType: 'Shift',
        'shift.assignments': { $elemMatch: { _id: assignmentId } }
      }).lean();
      
      if (!healthcare) {
        throw new Error('Shift assignment not found');
      }
      
      const assignment = healthcare.shift.assignments.find(a => a._id.toString() === assignmentId.toString());
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      
      const employee = await Employee.findOne({ employee_id: assignment.employee_id }).lean();
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      const regularRate = employee.salary?.amount || 0;
      const overtimeRate = regularRate * healthcare.shift.overtimeRules.overtimeRate;
      const doubleTimeRate = regularRate * healthcare.shift.overtimeRules.doubleTimeRate;
      
      let regularPay = 0;
      let overtimePay = 0;
      let doubleTimePay = 0;
      
      if (assignment.actualHours <= healthcare.shift.overtimeRules.dailyThreshold) {
        regularPay = assignment.actualHours * regularRate;
      } else {
        regularPay = healthcare.shift.overtimeRules.dailyThreshold * regularRate;
        const overtimeHours = assignment.actualHours - healthcare.shift.overtimeRules.dailyThreshold;
        
        if (overtimeHours <= 4) {
          overtimePay = overtimeHours * overtimeRate;
        } else {
          overtimePay = 4 * overtimeRate;
          doubleTimePay = (overtimeHours - 4) * doubleTimeRate;
        }
      }
      
      const totalPay = regularPay + overtimePay + doubleTimePay;
      
      // Update assignment
      await Healthcare.updateOne(
        { healthcare_id: healthcare.healthcare_id, 'shift.assignments._id': assignmentId },
        {
          $set: {
            'shift.assignments.$.payrollCalculated': true,
            'shift.assignments.$.payrollAmount': totalPay,
            'shift.assignments.$.isOvertime': assignment.actualHours > healthcare.shift.overtimeRules.dailyThreshold
          },
          updatedAt: new Date()
        }
      );
      
      return {
        success: true,
        message: 'Shift payroll calculated successfully',
        payroll: {
          assignment_id: assignmentId,
          employee_id: assignment.employee_id,
          regularHours: Math.min(assignment.actualHours, healthcare.shift.overtimeRules.dailyThreshold),
          overtimeHours: Math.max(0, assignment.actualHours - healthcare.shift.overtimeRules.dailyThreshold),
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
      const query = { organization_id: organizationId, entityType: 'Shift' };
      
      const records = await Healthcare.find(query).lean();
      
      const assignments = [];
      for (let record of records) {
        if (record.shift.assignments && record.shift.assignments.length > 0) {
          for (let assignment of record.shift.assignments) {
            // Apply filters
            if (filters.employee_id && assignment.employee_id !== filters.employee_id) continue;
            if (filters.status && assignment.status !== filters.status) continue;
            if (filters.startDate && new Date(assignment.assignedDate) < new Date(filters.startDate)) continue;
            if (filters.endDate && new Date(assignment.assignedDate) > new Date(filters.endDate)) continue;
            
            const employee = await Employee.findOne({ employee_id: assignment.employee_id }).lean();
            
            assignments.push({
              assignment_id: assignment._id,
              shift_id: record.healthcare_id,
              ...assignment,
              employee: employee ? {
                employee_id: employee.employee_id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email
              } : null,
              shift: {
                shift_id: record.healthcare_id,
                shiftName: record.shift.shiftName,
                shiftType: record.shift.shiftType
              }
            });
          }
        }
      }
      
      assignments.sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));
      
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
      const healthcare = new Healthcare({
        entityType: 'Policy',
        organization_id: policyData.organization_id,
        policy: policyData,
        createdBy: userId
      });
      
      await healthcare.save();
      
      await this.logAudit(userId, 'CREATE', 'HealthcarePolicies', healthcare.healthcare_id, 'New healthcare policy uploaded');
      
      return {
        success: true,
        message: 'Healthcare policy uploaded successfully',
        policy: {
          policy_id: healthcare.healthcare_id,
          policyName: healthcare.policy.policyName,
          policyType: healthcare.policy.policyType,
          version: healthcare.policy.version,
          status: healthcare.policy.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload policy: ${error.message}`);
    }
  }

  async listPolicies(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId, entityType: 'Policy' };
      
      if (filters.policyType) query['policy.policyType'] = filters.policyType;
      if (filters.status) query['policy.status'] = filters.status;
      if (filters.priority) query['policy.priority'] = filters.priority;
      
      const records = await Healthcare.find(query).sort({ 'policy.effectiveDate': -1 }).lean();
      
      const policies = records.map(r => ({
        policy_id: r.healthcare_id,
        ...r.policy
      }));
      
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
      const healthcare = new Healthcare({
        entityType: 'Workflow',
        organization_id: workflowData.organization_id,
        workflow: {
          ...workflowData,
          onboardingStatuses: []
        },
        createdBy: userId
      });
      
      await healthcare.save();
      
      await this.logAudit(userId, 'CREATE', 'HealthcareOnboardingWorkflow', healthcare.healthcare_id, 'New onboarding workflow created');
      
      return {
        success: true,
        message: 'Onboarding workflow created successfully',
        workflow: {
          workflow_id: healthcare.healthcare_id,
          workflowName: healthcare.workflow.workflowName,
          department: healthcare.workflow.department,
          position: healthcare.workflow.position,
          totalEstimatedDays: healthcare.workflow.totalEstimatedDays
        }
      };
    } catch (error) {
      throw new Error(`Failed to create onboarding workflow: ${error.message}`);
    }
  }

  async getOnboardingStatus(employeeId) {
    try {
      const records = await Healthcare.find({
        entityType: 'Workflow',
        'workflow.onboardingStatuses.employee_id': employeeId
      }).lean();
      
      if (!records || records.length === 0) {
        throw new Error('Onboarding status not found');
      }
      
      // Find the status for this employee
      for (let record of records) {
        const status = record.workflow.onboardingStatuses.find(s => s.employee_id === employeeId);
        if (status) {
          return {
            success: true,
            status: {
              status_id: status._id,
              workflow_id: record.healthcare_id,
              employee_id: employeeId,
              ...status,
              workflow: {
                workflow_id: record.healthcare_id,
                workflowName: record.workflow.workflowName,
                department: record.workflow.department,
                position: record.workflow.position
              }
            }
          };
        }
      }
      
      throw new Error('Onboarding status not found');
    } catch (error) {
      throw new Error(`Failed to get onboarding status: ${error.message}`);
    }
  }

  // ==================== ROLES SERVICES ====================

  async createHealthcareRole(roleData, userId) {
    try {
      const healthcare = new Healthcare({
        entityType: 'Role',
        organization_id: roleData.organization_id,
        role: roleData,
        createdBy: userId
      });
      
      await healthcare.save();
      
      await this.logAudit(userId, 'CREATE', 'HealthcareRoles', healthcare.healthcare_id, 'New healthcare role created');
      
      return {
        success: true,
        message: 'Healthcare role created successfully',
        role: {
          role_id: healthcare.healthcare_id,
          roleName: healthcare.role.roleName,
          roleType: healthcare.role.roleType,
          department: healthcare.role.department
        }
      };
    } catch (error) {
      throw new Error(`Failed to create healthcare role: ${error.message}`);
    }
  }

  async assignHealthcareRole(assignmentData, userId) {
    try {
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
      const query = { organization_id: organizationId, entityType: 'Audit' };
      
      if (filters.category) query['audit.category'] = filters.category;
      if (filters.severity) query['audit.severity'] = filters.severity;
      if (filters.user_id) query['audit.user_id'] = filters.user_id;
      if (filters.startDate) query['audit.timestamp'] = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query['audit.timestamp'] = {
          ...query['audit.timestamp'],
          $lte: new Date(filters.endDate)
        };
      }
      
      const records = await Healthcare.find(query)
        .sort({ 'audit.timestamp': -1 })
        .limit(filters.limit || 100)
        .lean();
      
      const auditLogs = [];
      for (let record of records) {
        const log = {
          audit_id: record.healthcare_id,
          ...record.audit
        };
        
        const user = await User.findOne({ user_id: record.audit.user_id }).lean();
        log.user = user ? {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null;
        
        auditLogs.push(log);
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
      const query = { organization_id: organizationId, entityType: 'Audit' };
      
      if (filters.category) query['audit.category'] = filters.category;
      if (filters.severity) query['audit.severity'] = filters.severity;
      if (filters.startDate) query['audit.timestamp'] = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query['audit.timestamp'] = {
          ...query['audit.timestamp'],
          $lte: new Date(filters.endDate)
        };
      }
      
      const records = await Healthcare.find(query).sort({ 'audit.timestamp': -1 }).lean();
      
      const auditLogs = [];
      for (let record of records) {
        const log = {
          audit_id: record.healthcare_id,
          ...record.audit
        };
        
        const user = await User.findOne({ user_id: record.audit.user_id }).lean();
        log.user = user ? {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null;
        
        auditLogs.push(log);
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

  async logAudit(userId, action, resource, resourceId, details, category = 'Other', organizationId = null) {
    try {
      if (!organizationId) {
        // Try to get organization_id from user or resource
        const user = await User.findOne({ user_id: userId }).lean();
        if (user && user.organization_id) {
          organizationId = user.organization_id;
        }
      }
      
      if (!organizationId) return;
      
      const auditLog = new Healthcare({
        entityType: 'Audit',
        organization_id: organizationId,
        audit: {
          user_id: userId,
          action,
          resource,
          resourceId: resourceId.toString(),
          details,
          category,
          timestamp: new Date()
        },
        createdBy: userId
      });
      
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log audit:', error.message);
    }
  }
}

module.exports = new HealthcareService();

