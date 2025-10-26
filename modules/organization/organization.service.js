const mongoose = require('mongoose');
const Organization = require('./organization.schema');
const User = require('../user/user.schema');

class OrganizationService {
  /**
   * Helper method to find organization by either _id or organization_id
   * @param {String|Number} id - Organization _id or organization_id
   * @returns {Object} Query object
   */
  _buildIdQuery(id) {
    // Remove any whitespace
    const cleanId = String(id).trim();
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
      return { _id: cleanId };
    }
    
    // Check if it's a numeric string (organization_id)
    if (!isNaN(cleanId) && cleanId !== '') {
      return { organization_id: parseInt(cleanId) };
    }
    
    // If neither valid, throw error
    throw { statusCode: 400, message: 'Invalid organization ID format' };
  }

  /**
   * List all organizations based on user role
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of organizations
   */
  async listOrganizations(user) {
    // Client Admin should only see their own organization
    if (user.role === 'Client Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.user_id });

      if (organization) {
        return [organization];
      } else {
        return [];
      }
    }

    // Super Admin or Client Manager sees all organizations
    return await Organization.find({});
  }

  /**
   * Create new organization
   * @param {Object} organizationData - Organization data
   * @returns {Promise<Object>} Created organization
   */
  async createOrganization(organizationData) {
    const { name, address, subscriptionPlan } = organizationData;
    
    try {
      const organization = await Organization.create({
        name,
        address,
        subscriptionPlan
      });

      return {
        message: 'Organization created successfully',
        organization
      };
    } catch (error) {
      if (error.code === 11000) {
        throw { statusCode: 400, message: 'An organization with this name already exists.' };
      }
      throw error;
    }
  }

  /**
   * Get organization details by ID
   * @param {String} organizationId - Organization ID (can be _id or organization_id)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Organization details
   */
  async getOrganizationDetails(organizationId, user) {
    let query;
    try {
      query = this._buildIdQuery(organizationId);
    } catch (error) {
      throw error; // Re-throw validation error
    }

    const organization = await Organization.findOne(query)
      .populate('clientAdmin', 'name email')
      .populate('hrAccountManager', 'name email');

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    // Authorization check for Client Admin: must be their organization
    if (user.role === 'Client Admin' && organization.clientAdmin !== user.user_id) {
      throw { statusCode: 403, message: 'Forbidden: You do not manage this organization.' };
    }

    return organization;
  }

  /**
   * Update organization information
   * @param {String} organizationId - Organization ID (can be _id or organization_id)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated organization
   */
  async updateOrganization(organizationId, updateData) {
    let query;
    try {
      query = this._buildIdQuery(organizationId);
    } catch (error) {
      throw error; // Re-throw validation error
    }

    const organization = await Organization.findOneAndUpdate(
      query,
      { 
        $set: { 
          name: updateData.name,
          address: updateData.address,
          subscriptionPlan: updateData.subscriptionPlan 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    return {
      message: 'Organization updated successfully',
      organization
    };
  }

  /**
   * Delete organization
   * @param {String} organizationId - Organization ID (can be _id or organization_id)
   * @returns {Promise<Object>} Success message
   */
  async deleteOrganization(organizationId) {
    let query;
    try {
      query = this._buildIdQuery(organizationId);
    } catch (error) {
      throw error; // Re-throw validation error
    }

    const organization = await Organization.findOne(query);

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    await Organization.deleteOne(query);

    return { message: 'Organization deleted successfully' };
  }

  /**
   * Configure HR/payroll policies
   * @param {String} organizationId - Organization ID (can be _id or organization_id)
   * @param {Object} settings - Policy settings
   * @param {String} userId - User ID (must be Client Admin)
   * @returns {Promise<Object>} Updated settings
   */
  async configurePolicies(organizationId, settings, userId) {
    let query;
    try {
      query = this._buildIdQuery(organizationId);
    } catch (error) {
      throw error; // Re-throw validation error
    }

    const organization = await Organization.findOne(query);

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    // Authorization check: Must be the Client Admin for this organization
    if (organization.clientAdmin !== userId) {
      throw { statusCode: 403, message: 'Forbidden: You must be the assigned Client Admin to configure policies.' };
    }

    // Merge existing settings with new settings
    organization.settings = { ...organization.settings, ...settings };
    await organization.save();

    return {
      message: 'Organization policies configured successfully',
      settings: organization.settings
    };
  }

  /**
   * Assign HR Account Manager to organization
   * @param {String} organizationId - Organization ID (can be _id or organization_id)
   * @param {String} managerId - Manager user ID
   * @returns {Promise<Object>} Success message with details
   */
  async assignAccountManager(organizationId, managerId) {
    if (!managerId) {
      throw { statusCode: 400, message: 'Manager ID is required.' };
    }

    // Validate if the user being assigned is actually an 'HR Account Manager'
    const manager = await User.findOne({ user_id: managerId });
    if (!manager || manager.role !== 'HR Account Manager') {
      throw { statusCode: 400, message: 'Invalid or unauthorized user ID provided. Must be an HR Account Manager.' };
    }

    // Assign the manager to the organization
    let query;
    try {
      query = this._buildIdQuery(organizationId);
    } catch (error) {
      throw error; // Re-throw validation error
    }

    const organization = await Organization.findOneAndUpdate(
      query,
      { hrAccountManager: managerId },
      { new: true }
    );

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found.' };
    }

    return {
      message: 'HR Account Manager assigned successfully',
      organization: organization.name,
      manager: manager.name
    };
  }

  /**
   * Assign Client Admin to organization
   * @param {String} organizationId - Organization ID (can be _id or organization_id)
   * @param {String} adminId - Client Admin user ID
   * @returns {Promise<Object>} Success message with details
   */
  async assignClientAdmin(organizationId, adminId) {
    if (!adminId) {
      throw { statusCode: 400, message: 'Client Admin ID is required.' };
    }

    // Validate if the user being assigned is actually a 'Client Admin'
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'Client Admin') {
      throw { statusCode: 400, message: 'Invalid or unauthorized user ID provided. Must be a Client Admin.' };
    }

    // Assign the admin to the organization
    let query;
    try {
      query = this._buildIdQuery(organizationId);
    } catch (error) {
      throw error; // Re-throw validation error
    }

    // Check if this admin is already assigned to another organization
    const existingOrg = await Organization.findOne({ clientAdmin: adminId });
    if (existingOrg) {
      // Check if it's the same organization using both _id and organization_id
      const existingOrgId = existingOrg._id.toString();
      const existingOrgNumId = existingOrg.organization_id;
      const requestedOrgId = organizationId;
      
      // Handle both query scenarios
      const isSameOrg = query._id 
        ? existingOrgId === query._id 
        : existingOrgNumId === query.organization_id;
      
      if (!isSameOrg) {
        throw { statusCode: 400, message: 'This Client Admin is already assigned to another organization.' };
      }
    }

    const organization = await Organization.findOneAndUpdate(
      query,
      { clientAdmin: adminId },
      { new: true }
    );

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found.' };
    }

    return {
      message: 'Client Admin assigned successfully',
      organization: organization.name,
      admin: admin.name
    };
  }
}

module.exports = new OrganizationService();

