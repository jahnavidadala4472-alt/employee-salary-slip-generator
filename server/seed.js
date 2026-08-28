const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./config/env');
const connectDB = require('./config/db');

const User = require('./models/User');
const Employee = require('./models/Employee');
const Company = require('./models/Company');
const SalarySlip = require('./models/SalarySlip');
const AIAnomaly = require('./models/AIAnomaly');
const AILog = require('./models/AILog');

const { calculateSalary } = require('./services/salaryService');
const { detectSalaryAnomalies } = require('./services/anomalyService');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Company.deleteMany({}),
      SalarySlip.deleteMany({}),
      AIAnomaly.deleteMany({}),
      AILog.deleteMany({})
    ]);

    console.log('[Seeder] Creating Demo Company Profile...');
    const company = await Company.create({
      companyName: 'Nexus Global Technologies Inc.',
      address: '742 Evergreen Terrace, Innovation Park, Suite 500, San Francisco, CA 94105',
      phone: '+1 (415) 555-0199',
      email: 'payroll@nexusglobal.io',
      website: 'https://nexusglobal.io',
      taxIdentifier: 'TAX-EIN-88392019'
    });

    console.log('[Seeder] Creating Admin and Employee Accounts...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
    const employeePasswordHash = await bcrypt.hash('Employee@12345', salt);

    // 1. Admin User
    await User.create({
      email: 'admin@payroll.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active'
    });

    // 2. Demo Employees
    const emp1 = await Employee.create({
      employeeId: 'EMP001',
      fullName: 'John Doe',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      joiningDate: new Date('2023-01-15'),
      phone: '+1 (555) 234-5678',
      email: 'john.doe@company.com',
      address: '450 Oak St, San Francisco, CA',
      bankName: 'Chase Bank',
      accountLast4: '4821',
      status: 'active'
    });

    await User.create({
      employeeId: 'EMP001',
      email: 'john.doe@company.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      status: 'active'
    });

    const emp2 = await Employee.create({
      employeeId: 'EMP002',
      fullName: 'Sarah Jenkins',
      department: 'Design',
      designation: 'Principal Product Designer',
      joiningDate: new Date('2023-06-01'),
      phone: '+1 (555) 345-6789',
      email: 'sarah.jenkins@company.com',
      address: '120 Pine Lane, Oakland, CA',
      bankName: 'Bank of America',
      accountLast4: '8830',
      status: 'active'
    });

    await User.create({
      employeeId: 'EMP002',
      email: 'sarah.jenkins@company.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      status: 'active'
    });

    const emp3 = await Employee.create({
      employeeId: 'EMP003',
      fullName: 'Michael Chang',
      department: 'Finance',
      designation: 'Senior Financial Analyst',
      joiningDate: new Date('2024-02-10'),
      phone: '+1 (555) 456-7890',
      email: 'michael.chang@company.com',
      address: '88 Market St, San Jose, CA',
      bankName: 'Wells Fargo',
      accountLast4: '1924',
      status: 'active'
    });

    await User.create({
      employeeId: 'EMP003',
      email: 'michael.chang@company.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      status: 'active'
    });

    console.log('[Seeder] Generating Historical & Anomalous Salary Slips...');

    // Slip 1: John Doe - June 2026 (Standard Normal Slip)
    const slip1Calc = calculateSalary({
      basicSalary: 6000,
      hra: 2400,
      allowances: 1200,
      bonus: 0,
      overtime: 0,
      tax: 800,
      pf: 720,
      esi: 150,
      otherDeductions: 0
    });
    const slip1 = await SalarySlip.create({
      slipNumber: 'SLIP-202606-1001',
      employeeId: 'EMP001',
      employee: emp1._id,
      month: 6,
      year: 2026,
      ...slip1Calc,
      notes: 'Regular monthly salary disbursement',
      status: 'approved'
    });

    // Slip 2: John Doe - July 2026 (Standard Normal Slip)
    const slip2Calc = calculateSalary({
      basicSalary: 6000,
      hra: 2400,
      allowances: 1200,
      bonus: 500,
      overtime: 250,
      tax: 850,
      pf: 720,
      esi: 150,
      otherDeductions: 0
    });
    const slip2 = await SalarySlip.create({
      slipNumber: 'SLIP-202607-1002',
      employeeId: 'EMP001',
      employee: emp1._id,
      month: 7,
      year: 2026,
      ...slip2Calc,
      notes: 'Monthly payout with minor sprint overtime',
      status: 'approved'
    });

    // Slip 3: John Doe - August 2026 (ANOMALOUS SLIP - Massive bonus of $4,500 + high overtime)
    const slip3Calc = calculateSalary({
      basicSalary: 6000,
      hra: 2400,
      allowances: 1200,
      bonus: 4500, // 75% of basic salary! -> Triggers High Bonus anomaly
      overtime: 2800, // 46% of basic salary! -> Triggers Excessive Overtime anomaly
      tax: 1800,
      pf: 720,
      esi: 150,
      otherDeductions: 200
    });
    const slip3 = await SalarySlip.create({
      slipNumber: 'SLIP-202608-1003',
      employeeId: 'EMP001',
      employee: emp1._id,
      month: 8,
      year: 2026,
      ...slip3Calc,
      notes: 'Annual executive project milestone bonus & critical release overtime',
      status: 'approved'
    });
    // Trigger anomaly detection on Slip 3 to create AI anomaly alerts in database
    await detectSalaryAnomalies(slip3, emp1);

    // Slip 4: Sarah Jenkins - July 2026
    const slip4Calc = calculateSalary({
      basicSalary: 5500,
      hra: 2200,
      allowances: 1000,
      bonus: 0,
      overtime: 0,
      tax: 700,
      pf: 660,
      esi: 140,
      otherDeductions: 0
    });
    await SalarySlip.create({
      slipNumber: 'SLIP-202607-2001',
      employeeId: 'EMP002',
      employee: emp2._id,
      month: 7,
      year: 2026,
      ...slip4Calc,
      notes: 'Standard monthly compensation',
      status: 'approved'
    });

    // Slip 5: Sarah Jenkins - August 2026
    const slip5Calc = calculateSalary({
      basicSalary: 5500,
      hra: 2200,
      allowances: 1000,
      bonus: 1000,
      overtime: 0,
      tax: 780,
      pf: 660,
      esi: 140,
      otherDeductions: 0
    });
    await SalarySlip.create({
      slipNumber: 'SLIP-202608-2002',
      employeeId: 'EMP002',
      employee: emp2._id,
      month: 8,
      year: 2026,
      ...slip5Calc,
      notes: 'Quarterly design lead performance award',
      status: 'approved'
    });

    // Slip 6: Michael Chang - August 2026
    const slip6Calc = calculateSalary({
      basicSalary: 4800,
      hra: 1900,
      allowances: 800,
      bonus: 0,
      overtime: 0,
      tax: 550,
      pf: 576,
      esi: 120,
      otherDeductions: 0
    });
    await SalarySlip.create({
      slipNumber: 'SLIP-202608-3001',
      employeeId: 'EMP003',
      employee: emp3._id,
      month: 8,
      year: 2026,
      ...slip6Calc,
      notes: 'Regular monthly salary disbursement',
      status: 'approved'
    });

    console.log('================================================================');
    console.log('✅ DEMO SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------------------');
    console.log('🔑 Admin Credentials:');
    console.log('   Email:    admin@payroll.com');
    console.log('   Password: Admin@12345');
    console.log('----------------------------------------------------------------');
    console.log('👤 Employee 1 (Contains AI Anomaly):');
    console.log('   Email:    john.doe@company.com');
    console.log('   Emp ID:   EMP001');
    console.log('   Password: Employee@12345');
    console.log('----------------------------------------------------------------');
    console.log('👤 Employee 2:');
    console.log('   Email:    sarah.jenkins@company.com');
    console.log('   Emp ID:   EMP002');
    console.log('   Password: Employee@12345');
    console.log('================================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
