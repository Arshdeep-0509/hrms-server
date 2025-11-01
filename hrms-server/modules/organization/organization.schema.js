const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  organization_id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  clientAdmin: {
    // Reference to the User who is the main admin for this organization
    type: String,
    required: false, // Optional initially, can be assigned later
  },
  hrAccountManager: {
    // Reference to the HR Account Manager assigned to this client
    type: String,
    required: false,
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String,
  },
  subscriptionPlan: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium'],
    default: 'Basic',
  },
  settings: {
    payrollCycle: {
      type: String,
      default: 'Bi-Weekly',
      enum: ['Weekly', 'Bi-Weekly', 'Monthly'],
    },
    ptoPolicy: {
      type: Number, // days per year
      default: 15,
    },
  }
}, { 
  timestamps: true
});

// Auto-generate organization_id before saving
OrganizationSchema.pre('save', async function(next) {
  if (this.isNew && !this.organization_id) {
    try {
      const lastOrg = await this.constructor.findOne({}, {}, { sort: { organization_id: -1 } });
      this.organization_id = lastOrg ? lastOrg.organization_id + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Organization', OrganizationSchema);

