const crypto = require("crypto");

/**
 * Menghasilkan plain-text token acak (setara panjang token Sanctum).
 */
function generatePlainTextToken() {
  return crypto.randomBytes(20).toString("hex"); // 40 karakter hex
}

/**
 * Sanctum menyimpan SHA-256 hash dari plain-text token di kolom `token`.
 */
function hashToken(plainTextToken) {
  return crypto.createHash("sha256").update(plainTextToken).digest("hex");
}

/**
 * Format token yang dikirim ke client: "{id}|{plainTextToken}"
 */
function formatBearerToken(id, plainTextToken) {
  return `${id}|${plainTextToken}`;
}

/**
 * Pisahkan "{id}|{plainTextToken}" menjadi { id, plainTextToken }.
 * Mengembalikan null jika formatnya tidak sesuai.
 */
function parseBearerToken(raw) {
  const idx = raw.indexOf("|");
  if (idx === -1) return null;

  const id = raw.slice(0, idx);
  const plainTextToken = raw.slice(idx + 1);

  if (!id || !plainTextToken || !/^\d+$/.test(id)) return null;

  return { id: Number(id), plainTextToken };
}

module.exports = {
  generatePlainTextToken,
  hashToken,
  formatBearerToken,
  parseBearerToken,
};
