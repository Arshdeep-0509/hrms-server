const assetService = require('./asset.service');

class AssetController {
  // ==================== ASSET MANAGEMENT CONTROLLERS ====================

  async registerAsset(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const assetData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await assetService.registerAsset(assetData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listAssets(req, res) {
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
        status: req.query.status,
        condition: req.query.condition,
        assignedTo: req.query.assignedTo,
        employee_id: req.query.employee_id,
        department_id: req.query.department_id,
        search: req.query.search
      };

      const result = await assetService.listAssets(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAssetById(req, res) {
    try {
      const { id } = req.params;
      const result = await assetService.getAssetById(parseInt(id));
      
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateAsset(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await assetService.updateAsset(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteAsset(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await assetService.deleteAsset(parseInt(id), userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== ASSET ASSIGNMENT CONTROLLERS ====================

  async assignAsset(req, res) {
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

      const result = await assetService.assignAsset(assignmentData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async returnAsset(req, res) {
    try {
      const userId = req.user.user_id;
      
      const result = await assetService.returnAsset(req.body, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async transferAsset(req, res) {
    try {
      const userId = req.user.user_id;
      
      const result = await assetService.transferAsset(req.body, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAssetLogs(req, res) {
    try {
      const { id } = req.params;
      const result = await assetService.getAssetLogs(parseInt(id));
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== MAINTENANCE CONTROLLERS ====================

  async scheduleMaintenance(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const maintenanceData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await assetService.scheduleMaintenance(maintenanceData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listMaintenanceSchedules(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        asset_id: req.query.asset_id,
        maintenanceType: req.query.maintenanceType,
        status: req.query.status,
        priority: req.query.priority,
        assignedTo: req.query.assignedTo
      };

      const result = await assetService.listMaintenanceSchedules(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== WARRANTY CONTROLLERS ====================

  async updateWarranty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      
      const result = await assetService.updateWarranty(parseInt(id), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== DEPRECIATION CONTROLLERS ====================

  async calculateDepreciation(req, res) {
    try {
      const { assetId } = req.body;
      
      if (!assetId) {
        return res.status(400).json({
          success: false,
          message: 'Asset ID is required'
        });
      }

      const result = await assetService.calculateDepreciation(assetId, req.body);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== REPORT CONTROLLERS ====================

  async reportLostAsset(req, res) {
    try {
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const reportData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await assetService.reportLostAsset(reportData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async markDisposed(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const organizationId = req.user.organization_id || req.body.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const disposalData = {
        ...req.body,
        organization_id: organizationId
      };

      const result = await assetService.markDisposed(parseInt(id), disposalData, userId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listDisposalRecords(req, res) {
    try {
      const organizationId = req.user.organization_id || req.query.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const filters = {
        disposalType: req.query.disposalType,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await assetService.listDisposalRecords(organizationId, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== SCAN CONTROLLERS ====================

  async scanAsset(req, res) {
    try {
      const { code } = req.params;
      const result = await assetService.scanAsset(code);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async generateBarcode(req, res) {
    try {
      const { id } = req.params;
      const result = await assetService.generateBarcode(parseInt(id));
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AssetController();
