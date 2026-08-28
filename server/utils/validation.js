/**
 * Validation utilities for API payloads
 */

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const re = /^[+0-9\s\-()]{7,20}$/;
  return re.test(phone.trim());
};

const isNonNegativeNumber = (val) => {
  if (val === undefined || val === null || val === '') return true; // optional handled separately
  const num = Number(val);
  return !isNaN(num) && num >= 0;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isNonNegativeNumber,
  sanitizeString
};
