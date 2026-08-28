const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    salarySlipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalarySlip',
      index: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    response: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('AILog', aiLogSchema);
