const healthcareService = require('./healthcare.service');

class HealthcareController {
  // ==================== RECRUITMENT CONTROLLERS ====================

  async createRecruitment(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const recruitmentData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await healthcareService.createRecruitment(recruitmentData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listRecruitments(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        status: req.query.status,
        department: req.query.department,
        specialty: req.query.specialty,
        priority: req.query.priority
      };

      const result = await healthcareService.listRecruitments(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRecruitmentById(req, res) {
    try {
      const { id } = req.params;
      const result = await healthcareService.getRecruitmentById(parseInt(id));
      
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateRecruitment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await healthcareService.updateRecruitment(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteRecruitment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await healthcareService.deleteRecruitment(parseInt(id), userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== CREDENTIALS CONTROLLERS ====================

  async addCredential(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const credentialData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await healthcareService.addCredential(credentialData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listCredentials(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        credentialType: req.query.credentialType,
        status: req.query.status,
        employee_id: req.query.employee_id
      };

      const result = await healthcareService.listCredentials(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async renewCredential(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await healthcareService.renewCredential(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async notifyExpiringCredentials(req, res) {
    try {
      const result = await healthcareService.notifyExpiringCredentials();
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteCredential(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await healthcareService.deleteCredential(parseInt(id), userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== SHIFTS CONTROLLERS ====================

  async createShift(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const shiftData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await healthcareService.createShift(shiftData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async assignShift(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const assignmentData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await healthcareService.assignShift(assignmentData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listShifts(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        department_id: req.query.department_id,
        shiftType: req.query.shiftType,
        isActive: req.query.isActive
      };

      const result = await healthcareService.listShifts(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async calculateShiftPayroll(req, res) {
    try {
      const { assignmentId } = req.body;
      
      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message: 'Assignment ID is required'
        });
      }

      const result = await healthcareService.calculateShiftPayroll(assignmentId, req.body);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getShiftLogs(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        employee_id: req.query.employee_id,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await healthcareService.getShiftLogs(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== POLICIES CONTROLLERS ====================

  async uploadPolicy(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const policyData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await healthcareService.uploadPolicy(policyData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listPolicies(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        policyType: req.query.policyType,
        status: req.query.status,
        priority: req.query.priority
      };

      const result = await healthcareService.listPolicies(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== ONBOARDING CONTROLLERS ====================

  async createOnboardingWorkflow(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const workflowData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await healthcareService.createOnboardingWorkflow(workflowData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getOnboardingStatus(req, res) {
    try {
      const { employeeId } = req.params;
      
      const result = await healthcareService.getOnboardingStatus(parseInt(employeeId));
      
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== ROLES CONTROLLERS ====================

  async createHealthcareRole(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const roleData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await healthcareService.createHealthcareRole(roleData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async assignHealthcareRole(req, res) {
    try {
      const userId = req.user.user_id;
      
      const result = await healthcareService.assignHealthcareRole(req.body, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== AUDIT CONTROLLERS ====================

  async getAuditLogs(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        category: req.query.category,
        severity: req.query.severity,
        user_id: req.query.user_id,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit
      };

      const result = await healthcareService.getAuditLogs(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async exportAuditLogs(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        category: req.query.category,
        severity: req.query.severity,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        format: req.query.format
      };

      const result = await healthcareService.exportAuditLogs(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new HealthcareController();
