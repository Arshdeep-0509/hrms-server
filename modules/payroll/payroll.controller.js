const payrollService = require('./payroll.service');

class PayrollController {
  /**
   * View payroll cycles
   * Accessible by: Client Admin / Payroll Specialist
   */
  async listPayrollCycles(req, res) {
    try {
      const cycles = await payrollService.listPayrollCycles(req.query, req.user);
      res.json(cycles);
    } catch (error) {
      console.error('Error fetching payroll cycles:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll cycles retrieval' });
    }
  }

  /**
   * Create new payroll cycle
   * Accessible by: Payroll Specialist
   */
  async createPayrollCycle(req, res) {
    try {
      const result = await payrollService.createPayrollCycle(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating payroll cycle:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll cycle creation' });
    }
  }

  /**
   * Update payroll cycle
   * Accessible by: Payroll Specialist
   */
  async updatePayrollCycle(req, res) {
    try {
      const result = await payrollService.updatePayrollCycle(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating payroll cycle:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll cycle update' });
    }
  }

  /**
   * Process payroll for employees
   * Accessible by: Payroll Specialist
   */
  async processPayroll(req, res) {
    try {
      const result = await payrollService.processPayroll(req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error processing payroll:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll processing' });
    }
  }

  /**
   * Fetch payslip for employee
   * Accessible by: Payroll / Employee
   */
  async getEmployeePayslips(req, res) {
    try {
      const payslips = await payrollService.getEmployeePayslips(req.params.employeeId, req.user);
      res.json(payslips);
    } catch (error) {
      console.error('Error fetching employee payslips:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payslips retrieval' });
    }
  }

  /**
   * View payroll tax details
   * Accessible by: Payroll / Bookkeeping
   */
  async listPayrollTaxes(req, res) {
    try {
      const taxes = await payrollService.listPayrollTaxes(req.query, req.user);
      res.json(taxes);
    } catch (error) {
      console.error('Error fetching payroll taxes:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll taxes retrieval' });
    }
  }

  /**
   * File tax reports
   * Accessible by: Payroll Specialist
   */
  async fileTaxReports(req, res) {
    try {
      const result = await payrollService.fileTaxReports(req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error filing tax reports:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during tax report filing' });
    }
  }

  /**
   * Generate payroll summaries
   * Accessible by: Payroll / Client Admin
   */
  async generatePayrollReports(req, res) {
    try {
      const result = await payrollService.generatePayrollReports(req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error generating payroll reports:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll report generation' });
    }
  }

  /**
   * Get payroll cycle by ID
   * Accessible by: Client Admin / Payroll Specialist
   */
  async getPayrollCycle(req, res) {
    try {
      const cycle = await payrollService.getPayrollCycleById(req.params.id, req.user);
      res.json(cycle);
    } catch (error) {
      console.error('Error fetching payroll cycle:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll cycle retrieval' });
    }
  }

  /**
   * Get payroll tax by ID
   * Accessible by: Payroll / Bookkeeping
   */
  async getPayrollTax(req, res) {
    try {
      const tax = await payrollService.getPayrollTaxById(req.params.id, req.user);
      res.json(tax);
    } catch (error) {
      console.error('Error fetching payroll tax:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll tax retrieval' });
    }
  }

  /**
   * Get payroll report by ID
   * Accessible by: Payroll / Client Admin
   */
  async getPayrollReport(req, res) {
    try {
      const report = await payrollService.getPayrollReportById(req.params.id, req.user);
      res.json(report);
    } catch (error) {
      console.error('Error fetching payroll report:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll report retrieval' });
    }
  }

  /**
   * Download payroll report
   * Accessible by: Payroll / Client Admin
   */
  async downloadPayrollReport(req, res) {
    try {
      const report = await payrollService.getPayrollReportById(req.params.id, req.user);
      
      // Mock file download - in real implementation, you would generate actual file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="payroll-report-${report.report_id}.pdf"`);
      res.json({
        message: 'Report download initiated',
        reportUrl: report.reportUrl,
        reportData: report.reportData,
      });
    } catch (error) {
      console.error('Error downloading payroll report:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll report download' });
    }
  }

  /**
   * Create payroll tax record
   * Accessible by: Payroll Specialist
   */
  async createPayrollTax(req, res) {
    try {
      const result = await payrollService.createPayrollTax(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating payroll tax:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll tax creation' });
    }
  }

  /**
   * Update payroll tax record
   * Accessible by: Payroll Specialist
   */
  async updatePayrollTax(req, res) {
    try {
      const result = await payrollService.updatePayrollTax(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating payroll tax:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payroll tax update' });
    }
  }

  /**
   * Get payslip by ID
   * Accessible by: Payroll / Employee
   */
  async getPayslip(req, res) {
    try {
      const payslip = await payrollService.getPayslipById(req.params.id, req.user);
      res.json(payslip);
    } catch (error) {
      console.error('Error fetching payslip:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payslip retrieval' });
    }
  }

  /**
   * Update payslip status
   * Accessible by: Payroll Specialist
   */
  async updatePayslipStatus(req, res) {
    try {
      const result = await payrollService.updatePayslipStatus(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating payslip status:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during payslip status update' });
    }
  }
}

module.exports = new PayrollController();
