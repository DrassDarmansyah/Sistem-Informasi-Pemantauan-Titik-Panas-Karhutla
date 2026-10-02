const { body } = require("express-validator");
const { User, Wilayah } = require("../models");
const { respondIfInvalid } = require("../utils/validate");

async function show(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Wilayah,
          as: "wilayah",
          attributes: ["id", "nama", "kabupaten", "provinsi"],
        },
      ],
    });

    return res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wilayah_id: user.wilayah_id,
        wilayah: user.wilayah ? user.wilayah.label : null,
      },
    });
  } catch (e) {
    next(e);
  }
}

const updateValidators = [
  body("wilayah_id").isInt().withMessage("Wilayah wajib dipilih."),
];

async function update(req, res, next) {
  try {
    if (respondIfInvalid(req, res)) return;

    const { wilayah_id } = req.body;
    const user = req.user;

    const errors = {};

    const wilayah = await Wilayah.findByPk(wilayah_id);
    if (!wilayah) {
      errors.wilayah_id = ["Wilayah yang dipilih tidak valid."];
    }

    if (Object.keys(errors).length > 0) {
      return res
        .status(422)
        .json({ message: "Data yang dikirim tidak valid.", errors });
    }

    user.wilayah_id = Number(wilayah_id);
    await user.save();

    // AC: perubahan langsung dipakai utk matching notifikasi berikutnya -> otomatis benar,
    // karena HotspotMatchingService selalu query tabel users terbaru saat ada hotspot baru.
    return res.json({
      message: "Profil berhasil diperbarui.",
      data: { id: user.id, email: user.email, wilayah_id: user.wilayah_id },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { show, update, updateValidators };
