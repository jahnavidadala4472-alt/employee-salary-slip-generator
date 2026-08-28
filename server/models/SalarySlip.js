const mongoose = require('mongoose');

const salarySlipSchema = new mongoose.Schema(
  {
    slipNumber: {
      type: String,
      required: [true, 'Salary slip number is required'],
      unique: true,
      trim: true,
      index: true
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      index: true
    },
    month: {
      type: Number,
      required: [true, 'Month is required (1-12)'],
      min: 1,
      max: 12,
      index: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100,
      index: true
    },
    // Earnings
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Basic salary cannot be negative'],
      default: 0
    },
    hra: {
      type: Number,
      min: [0, 'HRA cannot be negative'],
      default: 0
    },
    allowances: {
      type: Number,
      min: [0, 'Allowances cannot be negative'],
      default: 0
    },
    bonus: {
      type: Number,
      min: [0, 'Bonus cannot be negative'],
      default: 0
    },
    overtime: {
      type: Number,
      min: [0, 'Overtime cannot be negative'],
      default: 0
    },
    grossSalary: {
      type: Number,
      required: [true, 'Gross salary is required'],
      min: [0, 'Gross salary cannot be negative'],
      default: 0
    },
    // Deductions
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
      default: 0
    },
    pf: {
      type: Number,
      min: [0, 'PF cannot be negative'],
      default: 0
    },
    esi: {
      type: Number,
      min: [0, 'ESI cannot be negative'],
      default: 0
    },
    otherDeductions: {
      type: Number,
      min: [0, 'Other deductions cannot be negative'],
      default: 0
    },
    totalDeductions: {
      type: Number,
      required: [true, 'Total deductions is required'],
      min: [0, 'Total deductions cannot be negative'],
      default: 0
    },
    // Net
    netSalary: {
      type: Number,
      required: [true, 'Net salary is required'],
      min: [0, 'Net salary cannot be negative'],
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'rejected'],
      default: 'approved',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast employee month/year lookups
salarySlipSchema.index({ employeeId: 1, year: 1, month: 1 });

module.exports = mongoose.model('SalarySlip', salarySlipSchema);
