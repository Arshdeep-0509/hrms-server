const Organization = require('./organization.schema');
const User = require('../user/user.schema');

class OrganizationService {
  /**
   * List all organizations based on user role
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of organizations
   */
  async listOrganizations(user) {
    // Client Admin should only see their own organization
    if (user.role === 'Client Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.id })
        .populate('clientAdmin', 'name email')
        .populate('hrAccountManager', 'name email');

      if (organization) {
        return [organization];
      } else {
        return [];
      }
    }

    // Super Admin or Client Manager sees all organizations
    return await Organization.find({})
      .populate('clientAdmin', 'name email')
      .populate('hrAccountManager', 'name email');
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
   * @param {String} organizationId - Organization ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Organization details
   */
  async getOrganizationDetails(organizationId, user) {
    const organization = await Organization.findById(organizationId)
      .populate('clientAdmin', 'name email')
      .populate('hrAccountManager', 'name email');

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    // Authorization check for Client Admin: must be their organization
    if (user.role === 'Client Admin' && organization.clientAdmin?.toString() !== user.id) {
      throw { statusCode: 403, message: 'Forbidden: You do not manage this organization.' };
    }

    return organization;
  }

  /**
   * Update organization information
   * @param {String} organizationId - Organization ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated organization
   */
  async updateOrganization(organizationId, updateData) {
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
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
   * @param {String} organizationId - Organization ID
   * @returns {Promise<Object>} Success message
   */
  async deleteOrganization(organizationId) {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    await Organization.deleteOne({ _id: organizationId });

    return { message: 'Organization deleted successfully' };
  }

  /**
   * Configure HR/payroll policies
   * @param {String} organizationId - Organization ID
   * @param {Object} settings - Policy settings
   * @param {String} userId - User ID (must be Client Admin)
   * @returns {Promise<Object>} Updated settings
   */
  async configurePolicies(organizationId, settings, userId) {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw { statusCode: 404, message: 'Organization not found' };
    }

    // Authorization check: Must be the Client Admin for this organization
    if (organization.clientAdmin?.toString() !== userId) {
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
   * @param {String} organizationId - Organization ID
   * @param {String} managerId - Manager user ID
   * @returns {Promise<Object>} Success message with details
   */
  async assignAccountManager(organizationId, managerId) {
    if (!managerId) {
      throw { statusCode: 400, message: 'Manager ID is required.' };
    }

    // Validate if the user being assigned is actually an 'HR Account Manager'
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'HR Account Manager') {
      throw { statusCode: 400, message: 'Invalid or unauthorized user ID provided. Must be an HR Account Manager.' };
    }

    // Assign the manager to the organization
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
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
}

module.exports = new OrganizationService();

