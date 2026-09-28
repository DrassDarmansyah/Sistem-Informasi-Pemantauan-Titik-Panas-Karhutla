const bcrypt = require("bcryptjs");

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

async function hash(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

async function compare(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

/**
 * minimal 10 karakter, ada huruf besar, huruf kecil, angka, dan simbol.
 */
function isStrongPassword(value) {
  if (typeof value !== "string" || value.length < 10) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  if (!/[^a-zA-Z0-9]/.test(value)) return false;
  return true;
}

module.exports = { hash, compare, isStrongPassword, ROUNDS };
