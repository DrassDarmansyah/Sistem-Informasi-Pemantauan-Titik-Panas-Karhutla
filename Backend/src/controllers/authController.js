const { body } = require("express-validator");
const { User, Wilayah, PersonalAccessToken } = require("../models");
const { respondIfInvalid } = require("../utils/validate");
const passwordUtil = require("../utils/password");
const {
  generatePlainTextToken,
  hashToken,
  formatBearerToken,
} = require("../utils/token");

const DUMMY_HASH =
  "$2y$12$OfCvEvYEZlH6bQQn3.1Jx.bduIqkmVKtaZDsE42PgKHdN.L7Eom/G";

const registerValidators = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage("Nama wajib diisi."),
  body("email")
    .isEmail()
    .withMessage("Email tidak valid.")
    .isLength({ max: 255 }),
  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 20 })
    .matches(/^\+?[0-9\-\s]{8,20}$/)
    .withMessage("Format nomor WhatsApp tidak valid."),
  body("password")
    .isString()
    .custom((value) => passwordUtil.isStrongPassword(value))
    .withMessage(
      "Password minimal 10 karakter dan harus mengandung huruf besar, huruf kecil, angka, dan simbol.",
    ),
  body("password_confirmation").custom(
    (value, { req }) => value === req.body.password,
  ),
  body("wilayah_id").isInt().withMessage("Wilayah wajib dipilih."),
];

async function register(req, res, next) {
  try {
    if (respondIfInvalid(req, res)) return;

    const { name, email, phone, password, wilayah_id } = req.body;

    const normalizedEmail = String(email).toLowerCase().trim();

    const [emailTaken, phoneTaken, wilayahExists] = await Promise.all([
      User.findOne({ where: { email: normalizedEmail } }),
      phone ? User.findOne({ where: { phone } }) : null,
      Wilayah.findByPk(wilayah_id),
    ]);

    const errors = {};
    if (emailTaken) errors.email = ["Email ini sudah terdaftar."];
    if (phone && phoneTaken)
      errors.phone = ["Nomor ini sudah terdaftar pada akun lain."];
    if (!wilayahExists)
      errors.wilayah_id = ["Wilayah yang dipilih tidak valid."];

    if (Object.keys(errors).length > 0) {
      return res
        .status(422)
        .json({ message: "Data yang dikirim tidak valid.", errors });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone || null,
      password: await passwordUtil.hash(password),
      role: User.ROLE_WARGA, // dipaksa, diabaikan walau ada di payload
      wilayah_id,
    });

    return res.status(201).json({
      message: "Registrasi berhasil. Silakan login.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
}

const loginValidators = [
  body("email").isEmail().withMessage("Email tidak valid."),
  body("password").isString().notEmpty().withMessage("Password wajib diisi."),
];

async function login(req, res, next) {
  try {
    if (respondIfInvalid(req, res)) return;

    const email = String(req.body.email).toLowerCase().trim();
    const { password } = req.body;

    const user = await User.findOne({ where: { email } });
    const hashToCheck = user ? user.password : DUMMY_HASH;

    const matches = await passwordUtil.compare(password, hashToCheck);

    if (!user || !matches) {
      return res.status(422).json({
        message: "Email atau password salah.",
        errors: { email: ["Email atau password salah."] },
      });
    }

    // Hapus token lama supaya tidak menumpuk
    await PersonalAccessToken.destroy({
      where: { tokenable_id: user.id, tokenable_type: "User" },
    });

    const plainTextToken = generatePlainTextToken();
    const expirationMinutes = Number(
      process.env.TOKEN_EXPIRATION_MINUTES || 10080,
    );
    const expiresAt =
      expirationMinutes > 0
        ? new Date(Date.now() + expirationMinutes * 60000)
        : null;

    const tokenRecord = await PersonalAccessToken.create({
      tokenable_type: "User",
      tokenable_id: user.id,
      name: "api-token",
      token: hashToken(plainTextToken),
      expires_at: expiresAt,
    });

    const token = formatBearerToken(tokenRecord.id, plainTextToken);

    return res.json({
      message: "Login berhasil.",
      data: {
        token,
        token_type: "Bearer",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    await req.accessToken.destroy();
    return res.json({ message: "Logout berhasil." });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  register,
  registerValidators,
  login,
  loginValidators,
  logout,
};
