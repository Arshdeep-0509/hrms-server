const {
  ExpenseClaim,
  Receipt,
  ExpensePolicy
} = require('./expense.schema');
const User = require('../user/user.schema');
const Employee = require('../employee/employee.schema');

class ExpenseService {
  // ==================== CLAIM MANAGEMENT SERVICES ====================

  async createClaim(claimData, userId) {
    try {
      // Calculate total amount
      let totalAmount = 0;
      if (claimData.expenses && claimData.expenses.length > 0) {
        claimData.expenses.forEach(expense => {
          totalAmount += expense.amount || 0;
        });
      }

      const claim = new ExpenseClaim({
        ...claimData,
        submittedBy: userId,
        totalAmount: totalAmount,
        status: 'Draft'
      });
      
      await claim.save();
      
      return {
        success: true,
        message: 'Expense claim created successfully',
        claim: {
          claim_id: claim.claim_id,
          claimNumber: claim.claimNumber,
          title: claim.title,
          category: claim.category,
          totalAmount: claim.totalAmount,
          status: claim.status,
          submissionDate: claim.submissionDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to create claim: ${error.message}`);
    }
  }

  async updateClaim(claimId, updateData, userId) {
    try {
      const claim = await ExpenseClaim.findOne({ claim_id: claimId }).lean();
      
      if (!claim) {
        throw new Error('Expense claim not found');
      }

      // Check if claim can be updated
      if (claim.status !== 'Draft' && claim.status !== 'Submitted') {
        throw new Error('Claim cannot be updated in current status');
      }

      // Check if user is the owner
      if (claim.submittedBy !== userId) {
        throw new Error('You are not authorized to update this claim');
      }

      // Recalculate total amount if expenses are updated
      let totalAmount = claim.totalAmount;
      if (updateData.expenses && updateData.expenses.length > 0) {
        totalAmount = 0;
        updateData.expenses.forEach(expense => {
          totalAmount += expense.amount || 0;
        });
      }

      const updatedClaim = await ExpenseClaim.findOneAndUpdate(
        { claim_id: claimId },
        { 
          ...updateData, 
          totalAmount: totalAmount,
          lastModifiedDate: new Date()
        },
        { new: true, lean: true }
      );
      
      return {
        success: true,
        message: 'Expense claim updated successfully',
        claim: updatedClaim
      };
    } catch (error) {
      throw new Error(`Failed to update claim: ${error.message}`);
    }
  }

  async deleteClaim(claimId, userId) {
    try {
      const claim = await ExpenseClaim.findOne({ claim_id: claimId }).lean();
      
      if (!claim) {
        throw new Error('Expense claim not found');
      }

      // Check if claim can be deleted
      if (claim.status !== 'Draft') {
        throw new Error('Only draft claims can be deleted');
      }

      // Check if user is the owner
      if (claim.submittedBy !== userId) {
        throw new Error('You are not authorized to delete this claim');
      }

      await ExpenseClaim.updateOne(
        { claim_id: claimId },
        { status: 'Cancelled' }
      );
      
      return {
        success: true,
        message: 'Expense claim deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete claim: ${error.message}`);
    }
  }

  async listClaims(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.employee_id) query.employee_id = filters.employee_id;
      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;
      if (filters.priority) query.priority = filters.priority;
      if (filters.startDate) query.claimDate = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query.claimDate = {
          ...query.claimDate,
          $lte: new Date(filters.endDate)
        };
      }
      if (filters.currentApprover) query.currentApprover = filters.currentApprover;
      
      const claims = await ExpenseClaim.find(query)
        .sort({ submissionDate: -1 })
        .lean();
      
      // Add employee details
      for (let claim of claims) {
        const employee = await Employee.findOne({ employee_id: claim.employee_id }).lean();
        claim.employee = employee ? {
          employee_id: employee.employee_id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email
        } : null;

        // Add approver details
        if (claim.currentApprover) {
          const approver = await User.findOne({ user_id: claim.currentApprover }).lean();
          claim.approver = approver ? {
            user_id: approver.user_id,
            name: approver.name,
            email: approver.email
          } : null;
        }
      }
      
      return {
        success: true,
        claims,
        total: claims.length
      };
    } catch (error) {
      throw new Error(`Failed to list claims: ${error.message}`);
    }
  }

  async getClaimById(claimId, userId, userRole) {
    try {
      const claim = await ExpenseClaim.findOne({ claim_id: claimId }).lean();
      
      if (!claim) {
        throw new Error('Expense claim not found');
      }

      // Check authorization
      const isOwner = claim.submittedBy === userId;
      const isManager = ['Manager', 'Finance', 'Super Admin', 'Client Admin'].includes(userRole);
      const isCurrentApprover = claim.currentApprover === userId;

      if (!isOwner && !isManager && !isCurrentApprover) {
        throw new Error('You are not authorized to view this claim');
      }
      
      // Add employee details
      const employee = await Employee.findOne({ employee_id: claim.employee_id }).lean();
      claim.employee = employee ? {
        employee_id: employee.employee_id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email
      } : null;

      // Add approver details
      if (claim.currentApprover) {
        const approver = await User.findOne({ user_id: claim.currentApprover }).lean();
        claim.approver = approver ? {
          user_id: approver.user_id,
          name: approver.name,
          email: approver.email
        } : null;
      }

      // Add receipt details for each expense
      if (claim.expenses && claim.expenses.length > 0) {
        for (let expense of claim.expenses) {
          if (expense.receipt && expense.receipt.receipt_id) {
            const receipt = await Receipt.findOne({ receipt_id: expense.receipt.receipt_id }).lean();
            expense.receiptDetails = receipt;
          }
        }
      }
      
      return {
        success: true,
        claim
      };
    } catch (error) {
      throw new Error(`Failed to get claim: ${error.message}`);
    }
  }

  // ==================== RECEIPT SERVICES ====================

  async uploadReceipt(receiptData, fileData, userId) {
    try {
      const receipt = new Receipt({
        ...receiptData,
        ...fileData,
        uploadedBy: userId
      });
      
      await receipt.save();
      
      return {
        success: true,
        message: 'Receipt uploaded successfully',
        receipt: {
          receipt_id: receipt.receipt_id,
          filename: receipt.filename,
          fileType: receipt.fileType,
          uploadDate: receipt.uploadDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload receipt: ${error.message}`);
    }
  }

  async processOCR(receiptId) {
    try {
      const receipt = await Receipt.findOne({ receipt_id: receiptId }).lean();
      
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // In a real implementation, this would call an OCR service
      // For now, return mock OCR data
      const mockOCRData = {
        isProcessed: true,
        processedDate: new Date(),
        extractedData: {
          merchant: 'Sample Merchant',
          totalAmount: 100.00,
          date: new Date(),
          currency: 'USD',
          items: [
            {
              description: 'Sample Item',
              quantity: 1,
              amount: 100.00
            }
          ],
          taxAmount: 10.00,
          paymentMethod: 'Credit Card'
        },
        confidence: 85,
        rawText: 'Sample OCR extracted text'
      };

      await Receipt.updateOne(
        { receipt_id: receiptId },
        { ocrData: mockOCRData }
      );
      
      return {
        success: true,
        message: 'OCR processing completed',
        ocrData: mockOCRData
      };
    } catch (error) {
      throw new Error(`Failed to process OCR: ${error.message}`);
    }
  }

  async deleteReceipt(receiptId, userId) {
    try {
      const receipt = await Receipt.findOne({ receipt_id: receiptId }).lean();
      
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Check if user is authorized to delete
      if (receipt.uploadedBy !== userId) {
        throw new Error('You are not authorized to delete this receipt');
      }

      await Receipt.updateOne(
        { receipt_id: receiptId },
        { status: 'Deleted', isActive: false }
      );
      
      return {
        success: true,
        message: 'Receipt deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete receipt: ${error.message}`);
    }
  }

  // ==================== APPROVAL SERVICES ====================

  async approveClaim(claimId, approvalData, userId, userRole) {
    try {
      const claim = await ExpenseClaim.findOne({ claim_id: claimId });
      
      if (!claim) {
        throw new Error('Expense claim not found');
      }

      // Check if user is authorized to approve
      const isCurrentApprover = claim.currentApprover === userId;
      const isAuthorizedRole = ['Manager', 'Finance', 'Super Admin', 'Client Admin'].includes(userRole);

      if (!isCurrentApprover && !isAuthorizedRole) {
        throw new Error('You are not authorized to approve this claim');
      }

      // Update approval workflow
      if (claim.approvalWorkflow && claim.approvalWorkflow.length > 0) {
        const currentLevel = claim.approvalWorkflow.find(w => w.status === 'Pending');
        if (currentLevel) {
          currentLevel.status = 'Approved';
          currentLevel.approver_id = userId;
          currentLevel.comments = approvalData.comments;
          currentLevel.actionDate = new Date();
        }
      }

      await ExpenseClaim.updateOne(
        { claim_id: claimId },
        {
          status: 'Approved',
          approvedBy: userId,
          approvedDate: new Date(),
          currentApprover: null,
          approvalWorkflow: claim.approvalWorkflow
        }
      );
      
      return {
        success: true,
        message: 'Claim approved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to approve claim: ${error.message}`);
    }
  }

  async rejectClaim(claimId, rejectionData, userId) {
    try {
      const claim = await ExpenseClaim.findOne({ claim_id: claimId });
      
      if (!claim) {
        throw new Error('Expense claim not found');
      }

      // Check if user is authorized to reject
      const isCurrentApprover = claim.currentApprover === userId;
      
      if (!isCurrentApprover) {
        throw new Error('You are not authorized to reject this claim');
      }

      // Update approval workflow
      if (claim.approvalWorkflow && claim.approvalWorkflow.length > 0) {
        const currentLevel = claim.approvalWorkflow.find(w => w.status === 'Pending');
        if (currentLevel) {
          currentLevel.status = 'Rejected';
          currentLevel.approver_id = userId;
          currentLevel.comments = rejectionData.comments;
          currentLevel.actionDate = new Date();
        }
      }

      await ExpenseClaim.updateOne(
        { claim_id: claimId },
        {
          status: 'Rejected',
          rejectedBy: userId,
          rejectedDate: new Date(),
          rejectionReason: rejectionData.comments,
          currentApprover: null,
          approvalWorkflow: claim.approvalWorkflow
        }
      );
      
      return {
        success: true,
        message: 'Claim rejected successfully'
      };
    } catch (error) {
      throw new Error(`Failed to reject claim: ${error.message}`);
    }
  }

  async forwardClaim(claimId, forwardData, userId) {
    try {
      const claim = await ExpenseClaim.findOne({ claim_id: claimId });
      
      if (!claim) {
        throw new Error('Expense claim not found');
      }

      // Check if user is authorized to forward
      const isCurrentApprover = claim.currentApprover === userId;
      
      if (!isCurrentApprover) {
        throw new Error('You are not authorized to forward this claim');
      }

      // Update approval workflow
      if (claim.approvalWorkflow && claim.approvalWorkflow.length > 0) {
        const currentLevel = claim.approvalWorkflow.find(w => w.status === 'Pending');
        if (currentLevel) {
          currentLevel.status = 'Forwarded';
          currentLevel.approver_id = userId;
          currentLevel.comments = forwardData.comments;
          currentLevel.actionDate = new Date();
        }

        // Set next approver
        const nextLevel = claim.approvalWorkflow.find(w => w.status === 'Pending' && w.level > currentLevel.level);
        if (nextLevel) {
          await ExpenseClaim.updateOne(
            { claim_id: claimId },
            {
              status: 'Forwarded',
              currentApprover: nextLevel.approver_id,
              approvalWorkflow: claim.approvalWorkflow
            }
          );
        } else {
          // No more approvers, mark as approved
          await ExpenseClaim.updateOne(
            { claim_id: claimId },
            {
              status: 'Approved',
              approvedBy: userId,
              approvedDate: new Date(),
              currentApprover: null,
              approvalWorkflow: claim.approvalWorkflow
            }
          );
        }
      }
      
      return {
        success: true,
        message: 'Claim forwarded successfully'
      };
    } catch (error) {
      throw new Error(`Failed to forward claim: ${error.message}`);
    }
  }

  // ==================== PAYOUT SERVICES ====================

  async processPayout(claimId, payoutData, userId) {
    try {
      const claim = await ExpenseClaim.findOne({ claim_id: claimId });
      
      if (!claim) {
        throw new Error('Expense claim not found');
      }

      if (claim.status !== 'Approved') {
        throw new Error('Only approved claims can be reimbursed');
      }

      await ExpenseClaim.updateOne(
        { claim_id: claimId },
        {
          status: 'Reimbursed',
          reimbursedBy: userId,
          reimbursedDate: new Date(),
          reimbursementMethod: payoutData.reimbursementMethod,
          reimbursementReference: payoutData.reimbursementReference,
          paymentStatus: payoutData.paymentStatus || 'Processing'
        }
      );
      
      return {
        success: true,
        message: 'Payout processed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to process payout: ${error.message}`);
    }
  }

  // ==================== REPORT SERVICES ====================

  async getMonthlyExpenseReport(organizationId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const claims = await ExpenseClaim.find({
        organization_id: organizationId,
        status: { $in: ['Approved', 'Reimbursed'] },
        reimbursementDate: { $gte: startDate, $lte: endDate }
      }).lean();

      const totalAmount = claims.reduce((sum, claim) => sum + (claim.totalAmount || 0), 0);
      const approvedCount = claims.filter(c => c.status === 'Approved').length;
      const reimbursedCount = claims.filter(c => c.status === 'Reimbursed').length;

      const categoryBreakdown = {};
      claims.forEach(claim => {
        if (!categoryBreakdown[claim.category]) {
          categoryBreakdown[claim.category] = { count: 0, amount: 0 };
        }
        categoryBreakdown[claim.category].count++;
        categoryBreakdown[claim.category].amount += claim.totalAmount || 0;
      });

      return {
        success: true,
        report: {
          period: { month, year },
          summary: {
            totalClaims: claims.length,
            approvedCount,
            reimbursedCount,
            totalAmount
          },
          categoryBreakdown
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate monthly report: ${error.message}`);
    }
  }

  async getCategoryExpenseReport(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId };
      
      if (filters.startDate) query.claimDate = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query.claimDate = {
          ...query.claimDate,
          $lte: new Date(filters.endDate)
        };
      }
      if (filters.status) query.status = filters.status;

      const claims = await ExpenseClaim.find(query).lean();

      const categoryAnalytics = {};
      
      claims.forEach(claim => {
        if (!categoryAnalytics[claim.category]) {
          categoryAnalytics[claim.category] = {
            totalAmount: 0,
            claimCount: 0,
            approvedCount: 0,
            reimbursedCount: 0,
            rejectedCount: 0
          };
        }
        
        categoryAnalytics[claim.category].totalAmount += claim.totalAmount || 0;
        categoryAnalytics[claim.category].claimCount++;
        
        if (claim.status === 'Approved') categoryAnalytics[claim.category].approvedCount++;
        if (claim.status === 'Reimbursed') categoryAnalytics[claim.category].reimbursedCount++;
        if (claim.status === 'Rejected') categoryAnalytics[claim.category].rejectedCount++;
      });

      return {
        success: true,
        analytics: categoryAnalytics
      };
    } catch (error) {
      throw new Error(`Failed to generate category report: ${error.message}`);
    }
  }

  // ==================== POLICY SERVICES ====================

  async listPolicies(organizationId) {
    try {
      const policies = await ExpensePolicy.find({
        organization_id: organizationId,
        isActive: true
      })
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

  async updatePolicy(policyId, updateData, userId) {
    try {
      const policy = await ExpensePolicy.findOneAndUpdate(
        { policy_id: policyId },
        {
          ...updateData,
          lastModifiedBy: userId,
          lastModifiedDate: new Date()
        },
        { new: true, lean: true }
      );
      
      if (!policy) {
        throw new Error('Expense policy not found');
      }
      
      return {
        success: true,
        message: 'Policy updated successfully',
        policy
      };
    } catch (error) {
      throw new Error(`Failed to update policy: ${error.message}`);
    }
  }
}

module.exports = new ExpenseService();
