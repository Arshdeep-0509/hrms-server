const attendanceService = require('./attendance.service');

class AttendanceController {
  /**
   * Record employee check-in
   * Accessible by: Employee (self), HR, Client Admin
   */
  async clockIn(req, res) {
    try {
      const result = await attendanceService.clockIn(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error during clock in:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during clock in' });
    }
  }

  /**
   * Record employee check-out
   * Accessible by: Employee (self), HR, Client Admin
   */
  async clockOut(req, res) {
    try {
      const result = await attendanceService.clockOut(req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error during clock out:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during clock out' });
    }
  }

  /**
   * Create new shift
   * Accessible by: HR, Client Admin
   */
  async createShift(req, res) {
    try {
      const result = await attendanceService.createShift(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating shift:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during shift creation' });
    }
  }

  /**
   * Get overtime data for employee
   * Accessible by: Employee (self), HR, Client Admin
   */
  async getOvertimeData(req, res) {
    try {
      const overtimeData = await attendanceService.getOvertimeData(req.params.id, req.user);
      res.json(overtimeData);
    } catch (error) {
      console.error('Error fetching overtime data:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during overtime data retrieval' });
    }
  }

  /**
   * Generate attendance reports
   * Accessible by: HR, Client Admin
   */
  async generateAttendanceReports(req, res) {
    try {
      const result = await attendanceService.generateAttendanceReports(req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error generating attendance reports:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance report generation' });
    }
  }

  /**
   * Get attendance records for employee
   * Accessible by: Employee (self), HR, Client Admin
   */
  async getEmployeeAttendance(req, res) {
    try {
      const attendanceRecords = await attendanceService.getEmployeeAttendance(req.params.employeeId, req.user);
      res.json(attendanceRecords);
    } catch (error) {
      console.error('Error fetching employee attendance:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance records retrieval' });
    }
  }

  /**
   * List all shifts
   * Accessible by: HR, Client Admin
   */
  async listShifts(req, res) {
    try {
      const shifts = await attendanceService.listShifts(req.query, req.user);
      res.json(shifts);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during shifts retrieval' });
    }
  }

  /**
   * Get shift by ID
   * Accessible by: HR, Client Admin
   */
  async getShift(req, res) {
    try {
      const shift = await attendanceService.getShiftById(req.params.id, req.user);
      res.json(shift);
    } catch (error) {
      console.error('Error fetching shift:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during shift retrieval' });
    }
  }

  /**
   * Update shift
   * Accessible by: HR, Client Admin
   */
  async updateShift(req, res) {
    try {
      const result = await attendanceService.updateShift(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating shift:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during shift update' });
    }
  }

  /**
   * Delete shift
   * Accessible by: HR, Client Admin
   */
  async deleteShift(req, res) {
    try {
      const result = await attendanceService.deleteShift(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error deleting shift:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during shift deletion' });
    }
  }

  /**
   * Get attendance record by ID
   * Accessible by: Employee (self), HR, Client Admin
   */
  async getAttendanceRecord(req, res) {
    try {
      const record = await attendanceService.getAttendanceRecordById(req.params.id, req.user);
      res.json(record);
    } catch (error) {
      console.error('Error fetching attendance record:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance record retrieval' });
    }
  }

  /**
   * Update attendance record
   * Accessible by: HR, Client Admin
   */
  async updateAttendanceRecord(req, res) {
    try {
      const result = await attendanceService.updateAttendanceRecord(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating attendance record:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance record update' });
    }
  }

  /**
   * Approve attendance record
   * Accessible by: HR, Client Admin
   */
  async approveAttendanceRecord(req, res) {
    try {
      const result = await attendanceService.approveAttendanceRecord(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error approving attendance record:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance record approval' });
    }
  }

  /**
   * Get attendance report by ID
   * Accessible by: HR, Client Admin
   */
  async getAttendanceReport(req, res) {
    try {
      const report = await attendanceService.getAttendanceReportById(req.params.id, req.user);
      res.json(report);
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance report retrieval' });
    }
  }

  /**
   * Download attendance report
   * Accessible by: HR, Client Admin
   */
  async downloadAttendanceReport(req, res) {
    try {
      const report = await attendanceService.getAttendanceReportById(req.params.id, req.user);
      
      // Mock file download - in real implementation, you would generate actual file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${report.report_id}.pdf"`);
      res.json({
        message: 'Report download initiated',
        reportUrl: report.reportUrl,
        reportData: report.reportData,
      });
    } catch (error) {
      console.error('Error downloading attendance report:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance report download' });
    }
  }

  /**
   * Get overtime record by ID
   * Accessible by: Employee (self), HR, Client Admin
   */
  async getOvertimeRecord(req, res) {
    try {
      const record = await attendanceService.getOvertimeRecordById(req.params.id, req.user);
      res.json(record);
    } catch (error) {
      console.error('Error fetching overtime record:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during overtime record retrieval' });
    }
  }

  /**
   * Update overtime record
   * Accessible by: HR, Client Admin
   */
  async updateOvertimeRecord(req, res) {
    try {
      const result = await attendanceService.updateOvertimeRecord(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating overtime record:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during overtime record update' });
    }
  }

  /**
   * Approve overtime record
   * Accessible by: HR, Client Admin
   */
  async approveOvertimeRecord(req, res) {
    try {
      const result = await attendanceService.approveOvertimeRecord(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error approving overtime record:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during overtime record approval' });
    }
  }

  /**
   * Get attendance trends
   * Accessible by: HR, Client Admin
   */
  async getAttendanceTrends(req, res) {
    try {
      const trends = await attendanceService.getAttendanceTrends(req.query, req.user);
      res.json(trends);
    } catch (error) {
      console.error('Error fetching attendance trends:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance trends retrieval' });
    }
  }

  /**
   * Get today's attendance summary
   * Accessible by: HR, Client Admin
   */
  async getTodayAttendanceSummary(req, res) {
    try {
      const summary = await attendanceService.getTodayAttendanceSummary(req.user);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching today\'s attendance summary:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attendance summary retrieval' });
    }
  }
}

module.exports = new AttendanceController();
