const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isMongoConnected } = require('../config/db');
const { getStore, saveStore } = require('../config/localStore');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const SalarySlip = require('../models/SalarySlip');
const AIAnomaly = require('../models/AIAnomaly');
const AILog = require('../models/AILog');

// Generate unique Hex ObjectId string
const genId = () => new mongoose.Types.ObjectId().toString();

// --- USER REPO ---
const UserRepo = {
  findByEmail: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConnected()) {
      return await User.findOne({ email: cleanEmail });
    }
    const store = getStore();
    const u = store.users.find(x => x.email.toLowerCase() === cleanEmail);
    if (!u) return null;
    return {
      ...u,
      comparePassword: async (enteredPassword) => await bcrypt.compare(enteredPassword, u.passwordHash),
      toJSON: () => {
        const copy = { ...u };
        delete copy.passwordHash;
        return copy;
      }
    };
  },

  findById: async (id) => {
    if (isMongoConnected()) {
      return await User.findById(id).select('-passwordHash');
    }
    const store = getStore();
    const u = store.users.find(x => String(x._id) === String(id));
    if (!u) return null;
    const copy = { ...u };
    delete copy.passwordHash;
    return copy;
  },

  create: async (userData) => {
    if (isMongoConnected()) {
      return await User.create(userData);
    }
    const store = getStore();
    const newUser = {
      _id: genId(),
      employeeId: userData.employeeId || '',
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'employee',
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore();
    return newUser;
  },

  updateOne: async (query, update) => {
    if (isMongoConnected()) {
      return await User.updateOne(query, update);
    }
    const store = getStore();
    const user = store.users.find(u => {
      if (query.employeeId && u.employeeId === query.employeeId) return true;
      if (query.email && u.email === query.email) return true;
      return false;
    });
    if (user) {
      Object.assign(user, update, { updatedAt: new Date().toISOString() });
      saveStore();
    }
  }
};

// --- EMPLOYEE REPO ---
const EmployeeRepo = {
  find: async (filter = {}, skip = 0, limit = 50) => {
    if (isMongoConnected()) {
      return await Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }
    const store = getStore();
    let list = [...store.employees];

    if (filter.status && filter.status !== 'all') {
      list = list.filter(e => e.status === filter.status);
    }
    if (filter.department && filter.department !== 'all') {
      list = list.filter(e => e.department.toLowerCase() === filter.department.toLowerCase());
    }
    if (filter.designation && filter.designation !== 'all') {
      list = list.filter(e => e.designation.toLowerCase() === filter.designation.toLowerCase());
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      list = list.filter(e =>
        e.fullName.toLowerCase().includes(s) ||
        e.employeeId.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s) ||
        e.department.toLowerCase().includes(s) ||
        e.designation.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.slice(skip, skip + limit);
  },

  countDocuments: async (filter = {}) => {
    if (isMongoConnected()) {
      return await Employee.countDocuments(filter);
    }
    const list = await EmployeeRepo.find(filter, 0, 99999);
    return list.length;
  },

  findByIdOrEmpId: async (id) => {
    if (isMongoConnected()) {
      let emp = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        emp = await Employee.findById(id);
      }
      if (!emp) {
        emp = await Employee.findOne({ employeeId: id.toUpperCase().trim() });
      }
      return emp;
    }
    const store = getStore();
    const cleanId = String(id).toUpperCase().trim();
    return store.employees.find(e => String(e._id) === String(id) || e.employeeId === cleanId) || null;
  },

  findByEmployeeId: async (empId) => {
    if (isMongoConnected()) {
      return await Employee.findOne({ employeeId: empId.toUpperCase().trim() });
    }
    const store = getStore();
    return store.employees.find(e => e.employeeId === empId.toUpperCase().trim()) || null;
  },

  findByEmail: async (email) => {
    if (isMongoConnected()) {
      return await Employee.findOne({ email: email.toLowerCase().trim() });
    }
    const store = getStore();
    return store.employees.find(e => e.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  distinct: async (field) => {
    if (isMongoConnected()) {
      return await Employee.distinct(field);
    }
    const store = getStore();
    const values = store.employees.map(e => e[field]).filter(Boolean);
    return [...new Set(values)];
  },

  create: async (empData) => {
    if (isMongoConnected()) {
      return await Employee.create(empData);
    }
    const store = getStore();
    const newEmp = {
      _id: genId(),
      employeeId: empData.employeeId.toUpperCase().trim(),
      fullName: empData.fullName.trim(),
      department: empData.department.trim(),
      designation: empData.designation.trim(),
      joiningDate: new Date(empData.joiningDate).toISOString(),
      phone: empData.phone.trim(),
      email: empData.email.toLowerCase().trim(),
      address: empData.address || '',
      bankName: empData.bankName || '',
      accountLast4: empData.accountLast4 || '',
      status: empData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.employees.push(newEmp);
    saveStore();
    return newEmp;
  },

  update: async (id, updateData) => {
    if (isMongoConnected()) {
      const emp = await EmployeeRepo.findByIdOrEmpId(id);
      if (!emp) return null;
      Object.assign(emp, updateData);
      return await emp.save();
    }
    const store = getStore();
    const emp = await EmployeeRepo.findByIdOrEmpId(id);
    if (!emp) return null;
    const storeEmp = store.employees.find(e => String(e._id) === String(emp._id));
    if (storeEmp) {
      Object.assign(storeEmp, updateData, { updatedAt: new Date().toISOString() });
      saveStore();
      return storeEmp;
    }
    return null;
  }
};

// --- COMPANY REPO ---
const CompanyRepo = {
  get: async () => {
    if (isMongoConnected()) {
      let comp = await Company.findOne();
      if (!comp) {
        comp = await Company.create({
          companyName: 'Nexus Global Technologies Inc.',
          address: '742 Evergreen Terrace, Innovation Park, Suite 500, San Francisco, CA 94105',
          phone: '+1 (415) 555-0199',
          email: 'payroll@nexusglobal.io',
          website: 'https://nexusglobal.io',
          taxIdentifier: 'TAX-EIN-88392019'
        });
      }
      return comp;
    }
    const store = getStore();
    if (!store.company) {
      store.company = {
        _id: genId(),
        companyName: 'Nexus Global Technologies Inc.',
        address: '742 Evergreen Terrace, Innovation Park, Suite 500, San Francisco, CA 94105',
        phone: '+1 (415) 555-0199',
        email: 'payroll@nexusglobal.io',
        website: 'https://nexusglobal.io',
        taxIdentifier: 'TAX-EIN-88392019',
        logoPath: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveStore();
    }
    return store.company;
  },

  update: async (updateData) => {
    if (isMongoConnected()) {
      let comp = await Company.findOne();
      if (!comp) comp = new Company();
      Object.assign(comp, updateData);
      return await comp.save();
    }
    const store = getStore();
    const comp = await CompanyRepo.get();
    Object.assign(comp, updateData, { updatedAt: new Date().toISOString() });
    store.company = comp;
    saveStore();
    return comp;
  }
};

// --- SALARY SLIP REPO ---
const SalarySlipRepo = {
  find: async (filter = {}, skip = 0, limit = 50) => {
    if (isMongoConnected()) {
      return await SalarySlip.find(filter).populate('employee').sort({ year: -1, month: -1, createdAt: -1 }).skip(skip).limit(limit);
    }
    const store = getStore();
    let list = [...store.salarySlips];

    if (filter.employeeId && filter.employeeId !== 'all') {
      list = list.filter(s => s.employeeId === filter.employeeId.toUpperCase().trim());
    }
    if (filter.month && filter.month !== 'all') {
      list = list.filter(s => Number(s.month) === Number(filter.month));
    }
    if (filter.year && filter.year !== 'all') {
      list = list.filter(s => Number(s.year) === Number(filter.year));
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      list = list.filter(x => x.slipNumber.toLowerCase().includes(s) || x.employeeId.toLowerCase().includes(s));
    }

    list.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      if (b.month !== a.month) return b.month - a.month;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Populate employee
    const populated = list.map(s => {
      const emp = store.employees.find(e => e.employeeId === s.employeeId || String(e._id) === String(s.employee));
      return { ...s, employee: emp || null };
    });

    return populated.slice(skip, skip + limit);
  },

  countDocuments: async (filter = {}) => {
    if (isMongoConnected()) {
      return await SalarySlip.countDocuments(filter);
    }
    const list = await SalarySlipRepo.find(filter, 0, 99999);
    return list.length;
  },

  findByIdOrSlipNumber: async (id) => {
    if (isMongoConnected()) {
      let slip = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        slip = await SalarySlip.findById(id).populate('employee');
      }
      if (!slip) {
        slip = await SalarySlip.findOne({ slipNumber: id.trim() }).populate('employee');
      }
      return slip;
    }
    const store = getStore();
    const slip = store.salarySlips.find(s => String(s._id) === String(id) || s.slipNumber === String(id).trim());
    if (!slip) return null;
    const emp = store.employees.find(e => e.employeeId === slip.employeeId || String(e._id) === String(slip.employee));
    return { ...slip, employee: emp || null };
  },

  findByEmployeeMonthYear: async (employeeId, month, year) => {
    if (isMongoConnected()) {
      return await SalarySlip.findOne({
        employeeId: employeeId.toUpperCase().trim(),
        month: Number(month),
        year: Number(year)
      });
    }
    const store = getStore();
    return store.salarySlips.find(s =>
      s.employeeId === employeeId.toUpperCase().trim() &&
      Number(s.month) === Number(month) &&
      Number(s.year) === Number(year)
    ) || null;
  },

  create: async (slipData) => {
    if (isMongoConnected()) {
      return await SalarySlip.create(slipData);
    }
    const store = getStore();
    const newSlip = {
      _id: genId(),
      ...slipData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.salarySlips.push(newSlip);
    saveStore();
    return newSlip;
  },

  delete: async (id) => {
    if (isMongoConnected()) {
      return await SalarySlip.findByIdAndDelete(id);
    }
    const store = getStore();
    const idx = store.salarySlips.findIndex(s => String(s._id) === String(id));
    if (idx !== -1) {
      const removed = store.salarySlips.splice(idx, 1)[0];
      saveStore();
      return removed;
    }
    return null;
  }
};

// --- ANOMALY REPO ---
const AnomalyRepo = {
  find: async (filter = {}) => {
    if (isMongoConnected()) {
      return await AIAnomaly.find(filter).sort({ createdAt: -1 }).limit(50);
    }
    const store = getStore();
    let list = [...store.anomalies];
    if (filter.status && filter.status !== 'all') {
      list = list.filter(a => a.status === filter.status);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  },

  countDocuments: async (filter = {}) => {
    if (isMongoConnected()) {
      return await AIAnomaly.countDocuments(filter);
    }
    const list = await AnomalyRepo.find(filter);
    return list.length;
  },

  create: async (anomalyData) => {
    if (isMongoConnected()) {
      return await AIAnomaly.create(anomalyData);
    }
    const store = getStore();
    const existing = store.anomalies.find(a =>
      String(a.salarySlipId) === String(anomalyData.salarySlipId) &&
      a.reason === anomalyData.reason
    );
    if (existing) return existing;

    const newAnomaly = {
      _id: genId(),
      ...anomalyData,
      status: anomalyData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.anomalies.push(newAnomaly);
    saveStore();
    return newAnomaly;
  },

  updateStatus: async (id, status, reviewedBy = null) => {
    if (isMongoConnected()) {
      const anomaly = await AIAnomaly.findById(id);
      if (!anomaly) return null;
      anomaly.status = status;
      anomaly.reviewedBy = reviewedBy;
      anomaly.reviewedAt = new Date();
      return await anomaly.save();
    }
    const store = getStore();
    const anomaly = store.anomalies.find(a => String(a._id) === String(id));
    if (anomaly) {
      anomaly.status = status;
      anomaly.reviewedBy = reviewedBy;
      anomaly.reviewedAt = new Date().toISOString();
      saveStore();
      return anomaly;
    }
    return null;
  }
};

// --- AI LOG REPO ---
const AILogRepo = {
  create: async (logData) => {
    if (isMongoConnected()) {
      return await AILog.create(logData);
    }
    const store = getStore();
    store.aiLogs.push({
      _id: genId(),
      ...logData,
      createdAt: new Date().toISOString()
    });
    saveStore();
  }
};

module.exports = {
  UserRepo,
  EmployeeRepo,
  CompanyRepo,
  SalarySlipRepo,
  AnomalyRepo,
  AILogRepo
};
