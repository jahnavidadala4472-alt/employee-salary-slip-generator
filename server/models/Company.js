const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      default: 'Nexus Enterprises Inc.'
    },
    logoPath: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: '100 Innovation Boulevard, Tech Park, Suite 400, CA 94025'
    },
    phone: {
      type: String,
      trim: true,
      default: '+1 (555) 019-2834'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'payroll@nexusenterprises.com'
    },
    website: {
      type: String,
      trim: true,
      default: 'https://nexusenterprises.com'
    },
    taxIdentifier: {
      type: String,
      trim: true,
      default: 'TAX-EIN-9842103'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);
