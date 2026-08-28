const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../data');
const storeFilePath = path.join(dataDir, 'store.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate default demo data
const generateDefaultStore = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@12345', salt);
  const employeePasswordHash = bcrypt.hashSync('Employee@12345', salt);

  const adminId = '660000000000000000000001';
  const emp1Id = '660000000000000000000002';
  const emp2Id = '660000000000000000000003';
  const emp3Id = '660000000000000000000004';

  const slip1Id = '660000000000000000000011';
  const slip2Id = '660000000000000000000012';
  const slip3Id = '660000000000000000000013';
  const slip4Id = '660000000000000000000014';
  const slip5Id = '660000000000000000000015';

  return {
    users: [
      {
        _id: adminId,
        employeeId: '',
        email: 'admin@payroll.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '660000000000000000000005',
        employeeId: 'EMP001',
        email: 'john.doe@company.com',
        passwordHash: employeePasswordHash,
        role: 'employee',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '660000000000000000000006',
        employeeId: 'EMP002',
        email: 'sarah.jenkins@company.com',
        passwordHash: employeePasswordHash,
        role: 'employee',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '660000000000000000000007',
        employeeId: 'EMP003',
        email: 'michael.chang@company.com',
        passwordHash: employeePasswordHash,
        role: 'employee',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    employees: [
      {
        _id: emp1Id,
        employeeId: 'EMP001',
        fullName: 'John Doe',
        department: 'Engineering',
        designation: 'Senior Full Stack Engineer',
        joiningDate: '2023-01-15T00:00:00.000Z',
        phone: '+1 (555) 234-5678',
        email: 'john.doe@company.com',
        address: '450 Oak St, San Francisco, CA',
        bankName: 'Chase Bank',
        accountLast4: '4821',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: emp2Id,
        employeeId: 'EMP002',
        fullName: 'Sarah Jenkins',
        department: 'Design',
        designation: 'Principal Product Designer',
        joiningDate: '2023-06-01T00:00:00.000Z',
        phone: '+1 (555) 345-6789',
        email: 'sarah.jenkins@company.com',
        address: '120 Pine Lane, Oakland, CA',
        bankName: 'Bank of America',
        accountLast4: '8830',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: emp3Id,
        employeeId: 'EMP003',
        fullName: 'Michael Chang',
        department: 'Finance',
        designation: 'Senior Financial Analyst',
        joiningDate: '2024-02-10T00:00:00.000Z',
        phone: '+1 (555) 456-7890',
        email: 'michael.chang@company.com',
        address: '88 Market St, San Jose, CA',
        bankName: 'Wells Fargo',
        accountLast4: '1924',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    company: {
      _id: '660000000000000000000021',
      companyName: 'Nexus Global Technologies Inc.',
      address: '742 Evergreen Terrace, Innovation Park, Suite 500, San Francisco, CA 94105',
      phone: '+1 (415) 555-0199',
      email: 'payroll@nexusglobal.io',
      website: 'https://nexusglobal.io',
      taxIdentifier: 'TAX-EIN-88392019',
      logoPath: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    salarySlips: [
      {
        _id: slip1Id,
        slipNumber: 'SLIP-202606-1001',
        employeeId: 'EMP001',
        employee: emp1Id,
        month: 6,
        year: 2026,
        basicSalary: 6000,
        hra: 2400,
        allowances: 1200,
        bonus: 0,
        overtime: 0,
        grossSalary: 9600,
        tax: 800,
        pf: 720,
        esi: 150,
        otherDeductions: 0,
        totalDeductions: 1670,
        netSalary: 7930,
        notes: 'Regular monthly salary disbursement',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: slip2Id,
        slipNumber: 'SLIP-202607-1002',
        employeeId: 'EMP001',
        employee: emp1Id,
        month: 7,
        year: 2026,
        basicSalary: 6000,
        hra: 2400,
        allowances: 1200,
        bonus: 500,
        overtime: 250,
        grossSalary: 10350,
        tax: 850,
        pf: 720,
        esi: 150,
        otherDeductions: 0,
        totalDeductions: 1720,
        netSalary: 8630,
        notes: 'Monthly payout with sprint overtime',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: slip3Id,
        slipNumber: 'SLIP-202608-1003',
        employeeId: 'EMP001',
        employee: emp1Id,
        month: 8,
        year: 2026,
        basicSalary: 6000,
        hra: 2400,
        allowances: 1200,
        bonus: 4500, // Large bonus
        overtime: 2800, // Large overtime
        grossSalary: 16900,
        tax: 1800,
        pf: 720,
        esi: 150,
        otherDeductions: 200,
        totalDeductions: 2870,
        netSalary: 14030,
        notes: 'Annual executive project milestone bonus & critical release overtime',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: slip4Id,
        slipNumber: 'SLIP-202607-2001',
        employeeId: 'EMP002',
        employee: emp2Id,
        month: 7,
        year: 2026,
        basicSalary: 5500,
        hra: 2200,
        allowances: 1000,
        bonus: 0,
        overtime: 0,
        grossSalary: 8700,
        tax: 700,
        pf: 660,
        esi: 140,
        otherDeductions: 0,
        totalDeductions: 1500,
        netSalary: 7200,
        notes: 'Standard monthly compensation',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: slip5Id,
        slipNumber: 'SLIP-202608-2002',
        employeeId: 'EMP002',
        employee: emp2Id,
        month: 8,
        year: 2026,
        basicSalary: 5500,
        hra: 2200,
        allowances: 1000,
        bonus: 1000,
        overtime: 0,
        grossSalary: 9700,
        tax: 780,
        pf: 660,
        esi: 140,
        otherDeductions: 0,
        totalDeductions: 1580,
        netSalary: 8120,
        notes: 'Quarterly design lead performance award',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    anomalies: [
      {
        _id: '660000000000000000000031',
        salarySlipId: slip3Id,
        employeeId: 'EMP001',
        severity: 'high',
        reason: 'Unusually large bonus of $4,500.00 (75% of basic pay $6,000.00).',
        recommendation: 'Verify with HR department if this special bonus has written approval from department leadership.',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        _id: '660000000000000000000032',
        salarySlipId: slip3Id,
        employeeId: 'EMP001',
        severity: 'medium',
        reason: 'High overtime payout of $2,800.00 (47% of basic pay).',
        recommendation: 'Check logged timesheets and overtime pre-approvals for month 8/2026.',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ],
    aiLogs: []
  };
};

// Load Store from file or initialize
let inMemoryData = null;

const loadStore = () => {
  if (inMemoryData) return inMemoryData;

  try {
    if (fs.existsSync(storeFilePath)) {
      const raw = fs.readFileSync(storeFilePath, 'utf8');
      inMemoryData = JSON.parse(raw);
    } else {
      inMemoryData = generateDefaultStore();
      saveStore();
    }
  } catch (err) {
    inMemoryData = generateDefaultStore();
  }
  return inMemoryData;
};

const saveStore = () => {
  try {
    if (inMemoryData) {
      fs.writeFileSync(storeFilePath, JSON.stringify(inMemoryData, null, 2), 'utf8');
    }
  } catch (e) {
    console.warn('[LocalStore Save Warning]', e.message);
  }
};

const getStore = () => loadStore();

module.exports = {
  getStore,
  saveStore,
  generateDefaultStore
};
