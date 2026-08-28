/**
 * Authoritative Salary Calculation Service
 */

const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

const calculateSalary = (input) => {
  const basicSalary = round2(input.basicSalary);
  const hra = round2(input.hra);
  const allowances = round2(input.allowances);
  const bonus = round2(input.bonus);
  const overtime = round2(input.overtime);

  const tax = round2(input.tax);
  const pf = round2(input.pf);
  const esi = round2(input.esi);
  const otherDeductions = round2(input.otherDeductions);

  // Authoritative Calculation Formulas:
  // Gross Salary = Basic Salary + HRA + Other Allowances + Bonus + Overtime
  const grossSalary = round2(basicSalary + hra + allowances + bonus + overtime);

  // Total Deductions = Tax + PF + ESI + Other Deductions
  const totalDeductions = round2(tax + pf + esi + otherDeductions);

  // Net Salary = Gross Salary - Total Deductions
  const netSalary = round2(grossSalary - totalDeductions);

  return {
    basicSalary,
    hra,
    allowances,
    bonus,
    overtime,
    grossSalary,
    tax,
    pf,
    esi,
    otherDeductions,
    totalDeductions,
    netSalary
  };
};

/**
 * Convert number to words (Indian/Western standard suitable for salary slips)
 */
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  if (!num || isNaN(num)) return '';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += ' ' + a[n % 10];
      }
    }
    return str.trim();
  };

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  let result = inWords(integerPart) + ' Dollars';
  if (decimalPart > 0) {
    result += ' and ' + inWords(decimalPart) + ' Cents';
  }
  return result + ' Only';
};

const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const idx = Number(monthNumber) - 1;
  return months[idx] || '';
};

module.exports = {
  calculateSalary,
  numberToWords,
  getMonthName,
  round2
};
