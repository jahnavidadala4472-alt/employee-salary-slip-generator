const mongoose = require('mongoose');

const aiAnomalySchema = new mongoose.Schema(
  {
    salarySlipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalarySlip',
      required: true,
      index: true
    },
    employeeId: {
      type: String,
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Anomaly reason is required'],
      trim: true
    },
    recommendation: {
      type: String,
      required: [true, 'Recommendation is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
      index: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AIAnomaly', aiAnomalySchema);
