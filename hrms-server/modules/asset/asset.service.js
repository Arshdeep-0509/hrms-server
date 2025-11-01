const { Asset } = require('./asset.schema');
const User = require('../user/user.schema');
const Employee = require('../employee/employee.schema');
const Department = require('../department/department.schema');

class AssetService {
  // ==================== ASSET MANAGEMENT SERVICES ====================

  async registerAsset(assetData, userId) {
    try {
      const asset = new Asset({
        ...assetData,
        createdBy: userId,
        history: [],
        maintenanceSchedules: [],
        reports: []
      });
      
      await asset.save();
      
      return {
        success: true,
        message: 'Asset registered successfully',
        asset: {
          asset_id: asset.asset_id,
          assetCode: asset.assetCode,
          assetName: asset.assetName,
          category: asset.category,
          status: asset.status,
          purchaseDate: asset.purchaseDate,
          purchasePrice: asset.purchasePrice
        }
      };
    } catch (error) {
      throw new Error(`Failed to register asset: ${error.message}`);
    }
  }

  async listAssets(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId, isActive: true };
      
      if (filters.category) query.category = filters.category;
      if (filters.status) query.status = filters.status;
      if (filters.condition) query.condition = filters.condition;
      if (filters.assignedTo) {
        if (filters.assignedTo === 'unassigned') {
          query['assignedTo.type'] = { $exists: false };
        } else {
          query['assignedTo.type'] = filters.assignedTo;
        }
      }
      if (filters.employee_id) query['assignedTo.employee_id'] = filters.employee_id;
      if (filters.department_id) query['assignedTo.department_id'] = filters.department_id;
      if (filters.search) {
        query.$or = [
          { assetName: { $regex: filters.search, $options: 'i' } },
          { assetCode: { $regex: filters.search, $options: 'i' } },
          { serialNumber: { $regex: filters.search, $options: 'i' } },
          { brand: { $regex: filters.search, $options: 'i' } },
          { model: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const assets = await Asset.find(query)
        .sort({ createdAt: -1 })
        .lean();
      
      // Add assigned user/department details
      for (let asset of assets) {
        if (asset.assignedTo && asset.assignedTo.type === 'Employee') {
          const employee = await Employee.findOne({ employee_id: asset.assignedTo.employee_id }).lean();
          asset.assignedEmployee = employee ? {
            employee_id: employee.employee_id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email
          } : null;
        } else if (asset.assignedTo && asset.assignedTo.type === 'Department') {
          const department = await Department.findOne({ department_id: asset.assignedTo.department_id }).lean();
          asset.assignedDepartment = department ? {
            department_id: department.department_id,
            name: department.name
          } : null;
        }
      }
      
      return {
        success: true,
        assets,
        total: assets.length
      };
    } catch (error) {
      throw new Error(`Failed to list assets: ${error.message}`);
    }
  }

  async getAssetById(assetId) {
    try {
      const asset = await Asset.findOne({ asset_id: assetId }).lean();
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Add assigned user/department details
      if (asset.assignedTo && asset.assignedTo.type === 'Employee') {
        const employee = await Employee.findOne({ employee_id: asset.assignedTo.employee_id }).lean();
        asset.assignedEmployee = employee ? {
          employee_id: employee.employee_id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email
        } : null;
      } else if (asset.assignedTo && asset.assignedTo.type === 'Department') {
        const department = await Department.findOne({ department_id: asset.assignedTo.department_id }).lean();
        asset.assignedDepartment = department ? {
          department_id: department.department_id,
          name: department.name
        } : null;
      }
      
      return {
        success: true,
        asset
      };
    } catch (error) {
      throw new Error(`Failed to get asset: ${error.message}`);
    }
  }

  async updateAsset(assetId, updateData, userId) {
    try {
      const asset = await Asset.findOneAndUpdate(
        { asset_id: assetId },
        { ...updateData, updatedAt: new Date() },
        { new: true, lean: true }
      );
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      return {
        success: true,
        message: 'Asset updated successfully',
        asset
      };
    } catch (error) {
      throw new Error(`Failed to update asset: ${error.message}`);
    }
  }

  async deleteAsset(assetId, userId) {
    try {
      const asset = await Asset.findOneAndUpdate(
        { asset_id: assetId },
        { isActive: false, updatedAt: new Date() },
        { new: true, lean: true }
      );
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      return {
        success: true,
        message: 'Asset deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete asset: ${error.message}`);
    }
  }

  // ==================== ASSET ASSIGNMENT SERVICES ====================

  async assignAsset(assignmentData, userId) {
    try {
      const { asset_id, assignTo, assignType, reason, notes } = assignmentData;
      
      const asset = await Asset.findOne({ asset_id: asset_id });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      if (asset.status !== 'Available') {
        throw new Error('Asset is not available for assignment');
      }
      
      // Update asset assignment
      const assignmentInfo = {
        type: assignType,
        assignedDate: new Date(),
        assignedBy: userId
      };
      
      if (assignType === 'Employee') {
        assignmentInfo.employee_id = assignTo;
      } else if (assignType === 'Department') {
        assignmentInfo.department_id = assignTo;
      }
      
      // Add history entry
      const historyEntry = {
        action: 'Assigned',
        to: {
          type: assignType,
          employee_id: assignType === 'Employee' ? assignTo : null,
          department_id: assignType === 'Department' ? assignTo : null
        },
        actionDate: new Date(),
        actionBy: userId,
        reason: reason,
        notes: notes
      };
      
      await Asset.updateOne(
        { asset_id: asset_id },
        {
          assignedTo: assignmentInfo,
          status: 'Assigned',
          $push: { history: historyEntry },
          updatedAt: new Date()
        }
      );
      
      return {
        success: true,
        message: 'Asset assigned successfully',
        assignment: {
          asset_id: asset_id,
          assignType: assignType,
          assignTo: assignTo,
          assignedDate: assignmentInfo.assignedDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to assign asset: ${error.message}`);
    }
  }

  async returnAsset(returnData, userId) {
    try {
      const { asset_id, reason, notes, condition } = returnData;
      
      const asset = await Asset.findOne({ asset_id: asset_id });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      if (!asset.assignedTo || asset.status !== 'Assigned') {
        throw new Error('Asset is not currently assigned');
      }
      
      // Create return history entry
      const historyEntry = {
        action: 'Returned',
        from: {
          type: asset.assignedTo.type,
          employee_id: asset.assignedTo.employee_id,
          department_id: asset.assignedTo.department_id
        },
        actionDate: new Date(),
        actionBy: userId,
        reason: reason,
        notes: notes,
        condition: condition
      };
      
      // Update asset status
      await Asset.updateOne(
        { asset_id: asset_id },
        {
          $unset: { assignedTo: 1 },
          status: 'Available',
          condition: condition || asset.condition,
          $push: { history: historyEntry },
          updatedAt: new Date()
        }
      );
      
      return {
        success: true,
        message: 'Asset returned successfully',
        return: {
          asset_id: asset_id,
          returnedDate: new Date(),
          condition: condition
        }
      };
    } catch (error) {
      throw new Error(`Failed to return asset: ${error.message}`);
    }
  }

  async transferAsset(transferData, userId) {
    try {
      const { asset_id, fromType, fromId, toType, toId, reason, notes } = transferData;
      
      const asset = await Asset.findOne({ asset_id: asset_id });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      if (!asset.assignedTo || asset.status !== 'Assigned') {
        throw new Error('Asset is not currently assigned');
      }
      
      // Create transfer history entry
      const historyEntry = {
        action: 'Transferred',
        from: {
          type: fromType,
          employee_id: fromType === 'Employee' ? fromId : null,
          department_id: fromType === 'Department' ? fromId : null
        },
        to: {
          type: toType,
          employee_id: toType === 'Employee' ? toId : null,
          department_id: toType === 'Department' ? toId : null
        },
        actionDate: new Date(),
        actionBy: userId,
        reason: reason,
        notes: notes
      };
      
      // Update asset assignment
      const newAssignment = {
        type: toType,
        assignedDate: new Date(),
        assignedBy: userId
      };
      
      if (toType === 'Employee') {
        newAssignment.employee_id = toId;
      } else if (toType === 'Department') {
        newAssignment.department_id = toId;
      }
      
      await Asset.updateOne(
        { asset_id: asset_id },
        {
          assignedTo: newAssignment,
          $push: { history: historyEntry },
          updatedAt: new Date()
        }
      );
      
      return {
        success: true,
        message: 'Asset transferred successfully',
        transfer: {
          asset_id: asset_id,
          from: { type: fromType, id: fromId },
          to: { type: toType, id: toId },
          transferDate: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Failed to transfer asset: ${error.message}`);
    }
  }

  async getAssetLogs(assetId) {
    try {
      const asset = await Asset.findOne({ asset_id: assetId }).lean();
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      const logs = asset.history || [];
      
      // Sort logs by actionDate descending
      logs.sort((a, b) => new Date(b.actionDate) - new Date(a.actionDate));
      
      // Add user details
      for (let log of logs) {
        const user = await User.findOne({ user_id: log.actionBy }).lean();
        log.actionByUser = user ? {
          user_id: user.user_id,
          name: user.name,
          email: user.email
        } : null;
        
        // Add from/to details
        if (log.from && log.from.employee_id) {
          const employee = await Employee.findOne({ employee_id: log.from.employee_id }).lean();
          log.fromEmployee = employee ? {
            employee_id: employee.employee_id,
            firstName: employee.firstName,
            lastName: employee.lastName
          } : null;
        }
        
        if (log.from && log.from.department_id) {
          const department = await Department.findOne({ department_id: log.from.department_id }).lean();
          log.fromDepartment = department ? {
            department_id: department.department_id,
            name: department.name
          } : null;
        }
        
        if (log.to && log.to.employee_id) {
          const employee = await Employee.findOne({ employee_id: log.to.employee_id }).lean();
          log.toEmployee = employee ? {
            employee_id: employee.employee_id,
            firstName: employee.firstName,
            lastName: employee.lastName
          } : null;
        }
        
        if (log.to && log.to.department_id) {
          const department = await Department.findOne({ department_id: log.to.department_id }).lean();
          log.toDepartment = department ? {
            department_id: department.department_id,
            name: department.name
          } : null;
        }
      }
      
      return {
        success: true,
        logs,
        total: logs.length
      };
    } catch (error) {
      throw new Error(`Failed to get asset logs: ${error.message}`);
    }
  }

  // ==================== MAINTENANCE SERVICES ====================

  async scheduleMaintenance(maintenanceData, userId) {
    try {
      const { asset_id } = maintenanceData;
      
      const asset = await Asset.findOne({ asset_id: asset_id });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Create maintenance schedule entry
      const maintenanceEntry = {
        ...maintenanceData,
        createdBy: userId
      };
      delete maintenanceEntry.asset_id;
      delete maintenanceEntry.organization_id;
      
      await Asset.updateOne(
        { asset_id: asset_id },
        {
          $push: { maintenanceSchedules: maintenanceEntry },
          status: 'In Maintenance',
          updatedAt: new Date()
        }
      );
      
      // Also add to history
      const historyEntry = {
        action: 'Maintenance',
        actionDate: maintenanceEntry.scheduledDate || new Date(),
        actionBy: userId,
        notes: maintenanceEntry.notes || maintenanceEntry.description
      };
      
      await Asset.updateOne(
        { asset_id: asset_id },
        { $push: { history: historyEntry } }
      );
      
      return {
        success: true,
        message: 'Maintenance scheduled successfully',
        maintenance: {
          asset_id: asset_id,
          maintenanceType: maintenanceEntry.maintenanceType,
          title: maintenanceEntry.title,
          scheduledDate: maintenanceEntry.scheduledDate,
          status: maintenanceEntry.status || 'Scheduled'
        }
      };
    } catch (error) {
      throw new Error(`Failed to schedule maintenance: ${error.message}`);
    }
  }

  async listMaintenanceSchedules(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId, isActive: true };
      
      if (filters.asset_id) query.asset_id = filters.asset_id;
      
      const assets = await Asset.find(query).lean();
      
      // Extract maintenance schedules from assets
      let schedules = [];
      for (let asset of assets) {
        if (asset.maintenanceSchedules && asset.maintenanceSchedules.length > 0) {
          for (let schedule of asset.maintenanceSchedules) {
            // Apply filters
            if (filters.maintenanceType && schedule.maintenanceType !== filters.maintenanceType) continue;
            if (filters.status && schedule.status !== filters.status) continue;
            if (filters.priority && schedule.priority !== filters.priority) continue;
            if (filters.assignedTo && schedule.assignedTo !== filters.assignedTo) continue;
            
            const scheduleWithAsset = {
              ...schedule,
              asset_id: asset.asset_id,
              asset: {
                asset_id: asset.asset_id,
                assetCode: asset.assetCode,
                assetName: asset.assetName,
                category: asset.category
              }
            };
            schedules.push(scheduleWithAsset);
          }
        }
      }
      
      // Sort by scheduled date
      schedules.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      
      return {
        success: true,
        schedules,
        total: schedules.length
      };
    } catch (error) {
      throw new Error(`Failed to list maintenance schedules: ${error.message}`);
    }
  }

  // ==================== WARRANTY SERVICES ====================

  async updateWarranty(assetId, warrantyData, userId) {
    try {
      const asset = await Asset.findOneAndUpdate(
        { asset_id: assetId },
        { 
          warranty: warrantyData,
          updatedAt: new Date()
        },
        { new: true, lean: true }
      );
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      return {
        success: true,
        message: 'Warranty information updated successfully',
        warranty: asset.warranty
      };
    } catch (error) {
      throw new Error(`Failed to update warranty: ${error.message}`);
    }
  }

  // ==================== DEPRECIATION SERVICES ====================

  async calculateDepreciation(assetId, depreciationData) {
    try {
      const asset = await Asset.findOne({ asset_id: assetId });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      const { method, usefulLife, residualValue } = depreciationData;
      const purchasePrice = asset.purchasePrice;
      const purchaseDate = asset.purchaseDate;
      const currentDate = new Date();
      
      let depreciationRate = 0;
      let currentValue = 0;
      
      if (method === 'Straight Line') {
        depreciationRate = (purchasePrice - residualValue) / usefulLife;
        const yearsElapsed = (currentDate - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
        currentValue = Math.max(purchasePrice - (depreciationRate * yearsElapsed), residualValue);
      } else if (method === 'Declining Balance') {
        depreciationRate = 2 / usefulLife; // Double declining balance
        const yearsElapsed = (currentDate - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
        currentValue = purchasePrice * Math.pow(1 - depreciationRate, yearsElapsed);
      }
      
      // Update asset depreciation
      await Asset.updateOne(
        { asset_id: assetId },
        {
          'depreciation.method': method,
          'depreciation.usefulLife': usefulLife,
          'depreciation.residualValue': residualValue,
          'depreciation.currentValue': currentValue,
          'depreciation.depreciationRate': depreciationRate,
          updatedAt: new Date()
        }
      );
      
      return {
        success: true,
        message: 'Depreciation calculated successfully',
        depreciation: {
          asset_id: assetId,
          method: method,
          usefulLife: usefulLife,
          residualValue: residualValue,
          currentValue: currentValue,
          depreciationRate: depreciationRate,
          calculatedDate: currentDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate depreciation: ${error.message}`);
    }
  }

  // ==================== REPORT SERVICES ====================

  async reportLostAsset(reportData, userId) {
    try {
      const { asset_id } = reportData;
      
      const asset = await Asset.findOne({ asset_id: asset_id });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Create report entry
      const reportEntry = {
        ...reportData,
        reportedBy: userId
      };
      delete reportEntry.asset_id;
      delete reportEntry.organization_id;
      
      // Update asset status
      await Asset.updateOne(
        { asset_id: asset_id },
        {
          status: 'Lost',
          $push: { reports: reportEntry },
          updatedAt: new Date()
        }
      );
      
      // Create history entry
      const historyEntry = {
        action: 'Lost',
        actionDate: new Date(),
        actionBy: userId,
        reason: reportData.description,
        notes: reportData.notes
      };
      
      await Asset.updateOne(
        { asset_id: asset_id },
        { $push: { history: historyEntry } }
      );
      
      return {
        success: true,
        message: 'Asset reported as lost successfully',
        report: {
          asset_id: asset_id,
          reportType: reportEntry.reportType,
          status: reportEntry.status || 'Open'
        }
      };
    } catch (error) {
      throw new Error(`Failed to report lost asset: ${error.message}`);
    }
  }

  async markDisposed(assetId, disposalData, userId) {
    try {
      const asset = await Asset.findOne({ asset_id: assetId });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Update disposal information
      await Asset.updateOne(
        { asset_id: assetId },
        {
          status: 'Disposed',
          disposal: {
            ...disposalData,
            disposedBy: userId
          },
          updatedAt: new Date()
        }
      );
      
      // Create history entry
      const historyEntry = {
        action: 'Disposed',
        actionDate: new Date(),
        actionBy: userId,
        reason: disposalData.disposalReason,
        notes: disposalData.notes
      };
      
      await Asset.updateOne(
        { asset_id: assetId },
        { $push: { history: historyEntry } }
      );
      
      return {
        success: true,
        message: 'Asset marked as disposed successfully',
        disposal: {
          asset_id: assetId,
          disposalType: disposalData.disposalType,
          disposalDate: disposalData.disposalDate
        }
      };
    } catch (error) {
      throw new Error(`Failed to mark asset as disposed: ${error.message}`);
    }
  }

  async listDisposalRecords(organizationId, filters = {}) {
    try {
      const query = { organization_id: organizationId, isActive: true };
      
      if (filters.disposalType) query['disposal.disposalType'] = filters.disposalType;
      if (filters.status) query['disposal.status'] = filters.status;
      if (filters.startDate) query['disposal.disposalDate'] = { $gte: new Date(filters.startDate) };
      if (filters.endDate) {
        query['disposal.disposalDate'] = {
          ...query['disposal.disposalDate'],
          $lte: new Date(filters.endDate)
        };
      }
      
      const assets = await Asset.find(query).lean();
      
      // Extract disposal records
      const disposals = assets
        .filter(asset => asset.disposal && asset.disposal.disposalType)
        .map(asset => ({
          ...asset.disposal,
          asset_id: asset.asset_id,
          asset: {
            asset_id: asset.asset_id,
            assetCode: asset.assetCode,
            assetName: asset.assetName,
            category: asset.category
          }
        }));
      
      // Sort by disposal date
      disposals.sort((a, b) => new Date(b.disposalDate) - new Date(a.disposalDate));
      
      return {
        success: true,
        disposals,
        total: disposals.length
      };
    } catch (error) {
      throw new Error(`Failed to list disposal records: ${error.message}`);
    }
  }

  // ==================== SCAN SERVICES ====================

  async scanAsset(code) {
    try {
      const asset = await Asset.findOne({
        $or: [
          { assetCode: code },
          { qrCode: code },
          { barcode: code },
          { serialNumber: code }
        ],
        isActive: true
      }).lean();
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Add assigned user/department details
      if (asset.assignedTo && asset.assignedTo.type === 'Employee') {
        const employee = await Employee.findOne({ employee_id: asset.assignedTo.employee_id }).lean();
        asset.assignedEmployee = employee ? {
          employee_id: employee.employee_id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email
        } : null;
      } else if (asset.assignedTo && asset.assignedTo.type === 'Department') {
        const department = await Department.findOne({ department_id: asset.assignedTo.department_id }).lean();
        asset.assignedDepartment = department ? {
          department_id: department.department_id,
          name: department.name
        } : null;
      }
      
      return {
        success: true,
        asset
      };
    } catch (error) {
      throw new Error(`Failed to scan asset: ${error.message}`);
    }
  }

  async generateBarcode(assetId) {
    try {
      const asset = await Asset.findOne({ asset_id: assetId });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Generate QR code and barcode (in real implementation, use a QR/barcode library)
      const qrCode = `QR-${asset.assetCode}-${Date.now()}`;
      const barcode = `BC-${asset.assetCode}-${Date.now()}`;
      
      await Asset.updateOne(
        { asset_id: assetId },
        {
          qrCode: qrCode,
          barcode: barcode,
          updatedAt: new Date()
        }
      );
      
      return {
        success: true,
        message: 'Barcode generated successfully',
        codes: {
          asset_id: assetId,
          assetCode: asset.assetCode,
          qrCode: qrCode,
          barcode: barcode
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate barcode: ${error.message}`);
    }
  }
}

module.exports = new AssetService();
