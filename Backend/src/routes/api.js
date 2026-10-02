const express = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");

const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const hotspotController = require("../controllers/hotspotController");
const wilayahController = require("../controllers/wilayahController");
const summaryController = require("../controllers/summaryController");

const router = express.Router();

/**
 * @swagger
 * /wilayah:
 *   get:
 *     tags: [Wilayah]
 *     summary: Daftar wilayah administratif
 *     description: Dipakai sebagai sumber dropdown wilayah, publik (tanpa token) karena dibutuhkan sebelum user punya akun saat registrasi.
 *     responses:
 *       200:
 *         description: Daftar wilayah berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 1 }
 *                       nama: { type: string, example: "Kec. Pelalawan" }
 *                       label: { type: string, example: "Kec. Pelalawan, Pelalawan, Riau" }
 */
router.get("/wilayah", wilayahController.index);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrasi akun Warga
 *     description: Role selalu dipaksa "warga" walau dikirim field role lain. Dibatasi rate-limit 5x/10menit per IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, password_confirmation, wilayah_id]
 *             properties:
 *               name: { type: string, example: "Budi Santoso" }
 *               email: { type: string, format: email, example: "budi@example.com" }
 *               phone: { type: string, example: "081234567890", description: "Opsional" }
 *               password: { type: string, format: password, example: "Budi!Aman123", description: "Min. 10 karakter, kombinasi huruf besar/kecil, angka, dan simbol." }
 *               password_confirmation: { type: string, format: password, example: "Budi!Aman123" }
 *               wilayah_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Registrasi berhasil.
 *       422:
 *         description: Validasi gagal (email/nomor sudah terdaftar, password lemah, dsb).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       429:
 *         description: Terlalu banyak percobaan registrasi dari IP ini.
 */
router.post(
  "/auth/register",
  registerLimiter,
  authController.registerValidators,
  authController.register,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login (Warga maupun Operator)
 *     description: Mengembalikan bearer token yang harus disertakan di header Authorization untuk endpoint yang butuh login. Dibatasi rate-limit (5x/menit per email+IP, 20x/menit per IP).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "budi@example.com" }
 *               password: { type: string, format: password, example: "Budi!Aman123" }
 *     responses:
 *       200:
 *         description: Login berhasil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Login berhasil." }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string, example: "1|8e8226c134b29835ffaca3ed01390149bfcb3088" }
 *                     token_type: { type: string, example: "Bearer" }
 *                     user:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 3 }
 *                         name: { type: string, example: "Budi Santoso" }
 *                         email: { type: string, example: "budi@example.com" }
 *                         role: { type: string, example: "warga" }
 *       422:
 *         description: Email atau password salah.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       429:
 *         description: Terlalu banyak percobaan login.
 */
router.post(
  "/auth/login",
  loginLimiter,
  authController.loginValidators,
  authController.login,
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (mencabut token yang sedang dipakai)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logout berhasil.
 *       401:
 *         description: Token tidak valid/tidak dikirim.
 */
router.post("/auth/logout", authenticate, authController.logout);

/**
 * @swagger
 * /hotspots:
 *   get:
 *     tags: [Hotspots]
 *     summary: Daftar titik panas
 *     description: Publik, tanpa token. Bisa difilter kombinasi beberapa parameter sekaligus. Maks. 500 baris.
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date, example: "2026-09-01" }
 *         description: Format Y-m-d.
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date, example: "2026-09-30" }
 *         description: Format Y-m-d, harus >= start_date.
 *       - in: query
 *         name: confidence
 *         schema: { type: string, enum: [low, medium, high] }
 *     responses:
 *       200:
 *         description: Daftar titik panas berhasil diambil.
 *       422:
 *         description: Parameter filter tidak valid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/hotspots",
  hotspotController.indexValidators,
  hotspotController.index,
);

/**
 * @swagger
 * /hotspots/{id}:
 *   get:
 *     tags: [Hotspots]
 *     summary: Detail satu titik panas
 *     description: Publik, tanpa token.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail titik panas ditemukan.
 *       404:
 *         description: ID tidak ditemukan.
 */
router.get("/hotspots/:id", hotspotController.show);

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Lihat profil akun Warga yang sedang login
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profil ditemukan.
 *       401:
 *         description: Token tidak valid/tidak dikirim.
 *       403:
 *         description: Akun bukan role "warga".
 */
router.get(
  "/profile",
  authenticate,
  requireRole("warga"),
  profileController.show,
);

/**
 * @swagger
 * /profile:
 *   put:
 *     tags: [Profile]
 *     summary: Ubah wilayah notifikasi
 *     description: Khusus role "warga". Perubahan wilayah_id langsung dipakai untuk pencocokan notifikasi berikutnya.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wilayah_id]
 *             properties:
 *               wilayah_id: { type: integer, example: 2 }
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui.
 *       401:
 *         description: Token tidak valid/tidak dikirim.
 *       403:
 *         description: Akun bukan role "warga".
 *       422:
 *         description: Validasi gagal (wilayah tidak valid).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put(
  "/profile",
  authenticate,
  requireRole("warga"),
  profileController.updateValidators,
  profileController.update,
);

/**
 * @swagger
 * /summary:
 *   get:
 *     tags: [Summary]
 *     summary: Rekap agregasi titik panas
 *     description: Khusus role "operator". Berisi total, breakdown per tingkat kepercayaan, rekap per wilayah, dan tren harian.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema: { type: string, format: date, example: "2026-01-01" }
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema: { type: string, format: date, example: "2026-12-31" }
 *       - in: query
 *         name: wilayah_id
 *         schema: { type: integer }
 *         description: Opsional, filter ke satu wilayah saja.
 *     responses:
 *       200:
 *         description: Rekap berhasil dihitung.
 *       401:
 *         description: Token tidak valid/tidak dikirim.
 *       403:
 *         description: Akun bukan role "operator".
 *       422:
 *         description: Parameter tidak valid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/summary",
  authenticate,
  requireRole("operator"),
  summaryController.indexValidators,
  summaryController.index,
);

/**
 * @swagger
 * /me:
 *   get:
 *     tags: [Auth]
 *     summary: Data akun yang sedang login (untuk cek validitas token dari sisi FE)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Token valid, data user dikembalikan.
 *       401:
 *         description: Token tidak valid/tidak dikirim.
 */
router.get("/me", authenticate, (req, res) => {
  res.json({ data: req.user.toPublicJSON() });
});

module.exports = router;
