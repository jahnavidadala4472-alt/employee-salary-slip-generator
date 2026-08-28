/**
 * Generate unique and standardized salary slip number
 * Format: SLIP-YYYYMM-XXXX
 * Example: SLIP-202608-1001
 */
const SalarySlip = require('../models/SalarySlip');

const generateSlipNumber = async (year, month) => {
  const paddedMonth = String(month).padStart(2, '0');
  const prefix = `SLIP-${year}${paddedMonth}-`;

  // Count existing slips for this year/month to sequence or generate random unique suffix
  const count = await SalarySlip.countDocuments({
    year: Number(year),
    month: Number(month)
  });

  const sequence = String(count + 1).padStart(4, '0');
  let candidate = `${prefix}${sequence}`;

  // Ensure absolute uniqueness
  let exists = await SalarySlip.exists({ slipNumber: candidate });
  if (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `${prefix}${randomSuffix}`;
  }

  return candidate;
};

module.exports = generateSlipNumber;
