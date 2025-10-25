const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  organisation_id: {
    type: String,
    unique: true,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    }
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  clientAdmin: {
    // Reference to the User who is the main admin for this organization
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional initially, can be assigned later
  },
  hrAccountManager: {
    // Reference to the HR Account Manager assigned to this client
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String,
  },
  // Example for client-specific configurations
  subscriptionPlan: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium'],
    default: 'Basic',
  },
  // Example for HR/Payroll Policy Settings
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
    // Add other relevant policies here
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);

