const rateLimit = require("express-rate-limit");

const tooManyRequests = (req, res) => {
  res.status(429).json({
    message: "Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.",
  });
};

/**
 * Limiter umum untuk seluruh route /api (setara throttleApi('api') +
 * RateLimiter::for('api', ...) — 60 request/menit per user (jika login)
 * atau per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `user:${req.user.id}` : req.ip),
  handler: tooManyRequests,
});

/**
 * Limiter khusus login (setara RateLimiter::for('login', ...)):
 * - 5 percobaan/menit dikunci per kombinasi email+IP
 * - 20 percobaan/menit per IP (mencegah credential stuffing lintas akun)
 */
const loginLimiterByEmailAndIp = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = String(req.body?.email || "").toLowerCase();
    return `${email}|${req.ip}`;
  },
  handler: tooManyRequests,
});

const loginLimiterByIp = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: tooManyRequests,
});

const loginLimiter = [loginLimiterByEmailAndIp, loginLimiterByIp];

/**
 * Limiter registrasi (setara RateLimiter::for('register', ...)):
 * 5 percobaan / 10 menit per IP.
 */
const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: tooManyRequests,
});

module.exports = { apiLimiter, loginLimiter, registerLimiter };
