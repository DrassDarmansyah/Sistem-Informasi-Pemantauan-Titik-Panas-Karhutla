const { query } = require("express-validator");
const { Op } = require("sequelize");
const { Hotspot, Wilayah } = require("../models");
const { respondIfInvalid } = require("../utils/validate");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !isNaN(d.getTime());
}

const indexValidators = [
  query("start_date")
    .optional({ checkFalsy: true })
    .custom(isValidDate)
    .withMessage("Format tanggal tidak valid (Y-m-d)."),
  query("end_date")
    .optional({ checkFalsy: true })
    .custom(isValidDate)
    .withMessage("Format tanggal tidak valid (Y-m-d).")
    .bail()
    .custom((value, { req }) => {
      if (!req.query.start_date) return true;
      return value >= req.query.start_date;
    })
    .withMessage("end_date harus >= start_date."),
  query("confidence")
    .optional({ checkFalsy: true })
    .customSanitizer((v) => String(v).toLowerCase())
    .isIn(["low", "medium", "high"])
    .withMessage("The selected confidence is invalid."),
];

async function index(req, res, next) {
  try {
    if (respondIfInvalid(req, res, "Parameter tidak valid.")) return;

    // Filter opsional dari peta: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&confidence=low|medium|high
    const { start_date, end_date, confidence } = req.query;
    const where = {};
    if (start_date || end_date) {
      where.acq_date = {};
      if (start_date) where.acq_date[Op.gte] = start_date;
      if (end_date) where.acq_date[Op.lte] = end_date;
    }
    if (["low", "medium", "high"].includes(confidence)) {
      where.confidence_level = confidence;
    }

    const hotspots = await Hotspot.findAll({
      where,
      attributes: [
        "id",
        "latitude",
        "longitude",
        "confidence_level",
        "detected_at",
        "satellite",
      ],
      order: [["detected_at", "DESC"]],
      limit: 500, // Story #3: tetap responsif untuk data hingga 500 titik
    });

    return res.json({ data: hotspots });
  } catch (e) {
    next(e);
  }
}

async function show(req, res, next) {
  try {
    const hotspot = await Hotspot.findByPk(req.params.id, {
      include: [{ model: Wilayah, as: "wilayah" }],
    });

    if (!hotspot) {
      // Story #4: status 404 beserta pesan error yang jelas jika ID tidak ditemukan.
      return res
        .status(404)
        .json({ message: "Titik panas dengan ID tersebut tidak ditemukan." });
    }

    return res.json({
      data: {
        id: hotspot.id,
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
        confidence_level: hotspot.confidence_level,
        brightness: hotspot.brightness,
        frp: hotspot.frp,
        satellite: hotspot.satellite,
        detected_at: new Date(hotspot.detected_at).toISOString(),
        wilayah: hotspot.wilayah ? hotspot.wilayah.label : null,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { index, indexValidators, show };
