const expenseService = require('./expense.service');

class ExpenseController {
  // ==================== CLAIM MANAGEMENT CONTROLLERS ====================

  async createClaim(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      const employeeId = req.user.employee_id || req.body.employee_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }

      const claimData = {
        ...req.body,
        organization_id: organizationId,
        employee_id: employeeId
      };

      const result = await expenseService.createClaim(claimData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateClaim(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await expenseService.updateClaim(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteClaim(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await expenseService.deleteClaim(parseInt(id), userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listClaims(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        employee_id: req.query.employee_id || req.user.employee_id,
        status: req.query.status,
        category: req.query.category,
        priority: req.query.priority,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        currentApprover: req.query.currentApprover
      };

      const result = await expenseService.listClaims(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getClaimById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const userRole = req.user.role;
      
      const result = await expenseService.getClaimById(parseInt(id), userId, userRole);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== RECEIPT CONTROLLERS ====================

  async uploadReceipt(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      const employeeId = req.user.employee_id || req.body.employee_id;
      
      if (!organizationId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID and Employee ID are required'
        });
      }

      // In a real implementation, file upload handling would be done here
      // For now, we'll use the file data from req.file or req.body
      const fileData = req.file || {
        filename: req.body.filename || 'receipt.pdf',
        originalFilename: req.body.originalFilename || 'receipt.pdf',
        path: req.body.path || '/uploads/receipts/',
        url: req.body.url,
        fileType: req.body.fileType || 'PDF',
        fileSize: req.body.fileSize || 0,
        mimeType: req.body.mimeType || 'application/pdf'
      };

      const receiptData = {
        organization_id: organizationId,
        employee_id: employeeId,
        claim_id: req.body.claim_id,
        expense_id: req.body.expense_id
      };

      const result = await expenseService.uploadReceipt(receiptData, fileData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async processOCR(req, res) {
    try {
      const { receiptId } = req.body;
      
      if (!receiptId) {
        return res.status(400).json({
          success: false,
          message: 'Receipt ID is required'
        });
      }

      const result = await expenseService.processOCR(receiptId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteReceipt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await expenseService.deleteReceipt(parseInt(id), userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== APPROVAL CONTROLLERS ====================

  async approveClaim(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const userRole = req.user.role;
      
      const result = await expenseService.approveClaim(parseInt(id), req.body, userId, userRole);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async rejectClaim(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await expenseService.rejectClaim(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async forwardClaim(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await expenseService.forwardClaim(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== PAYOUT CONTROLLERS ====================

  async processPayout(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await expenseService.processPayout(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== REPORT CONTROLLERS ====================

  async getMonthlyExpenseReport(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const result = await expenseService.getMonthlyExpenseReport(organizationId, month, year);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCategoryExpenseReport(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        status: req.query.status
      };

      const result = await expenseService.getCategoryExpenseReport(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== POLICY CONTROLLERS ====================

  async listPolicies(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const result = await expenseService.listPolicies(organizationId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePolicy(req, res) {
    try {
      const { policyId } = req.body;
      const userId = req.user.user_id;
      
      if (!policyId) {
        return res.status(400).json({
          success: false,
          message: 'Policy ID is required'
        });
      }

      const result = await expenseService.updatePolicy(policyId, req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ExpenseController();
