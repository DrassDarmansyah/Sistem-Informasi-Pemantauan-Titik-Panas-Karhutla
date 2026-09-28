const { query } = require("express-validator");
const { Op, fn, col } = require("sequelize");
const { Hotspot, Wilayah } = require("../models");
const { respondIfInvalid } = require("../utils/validate");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !isNaN(d.getTime());
}

const indexValidators = [
  query("wilayah_id")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("wilayah_id tidak valid."),
  query("start_date")
    .custom(isValidDate)
    .withMessage("Format tanggal tidak valid (Y-m-d)."),
  query("end_date")
    .custom(isValidDate)
    .withMessage("Format tanggal tidak valid (Y-m-d).")
    .bail()
    .custom((value, { req }) => value >= req.query.start_date)
    .withMessage("end_date harus >= start_date."),
];

async function index(req, res, next) {
  try {
    if (respondIfInvalid(req, res, "Parameter tidak valid.")) return;

    const { wilayah_id, start_date, end_date } = req.query;

    if (wilayah_id) {
      const wilayah = await Wilayah.findByPk(wilayah_id);
      if (!wilayah) {
        return res.status(422).json({
          message: "Parameter tidak valid.",
          errors: { wilayah_id: ["Wilayah yang dipilih tidak valid."] },
        });
      }
    }

    const baseWhere = {
      acq_date: { [Op.gte]: start_date, [Op.lte]: end_date },
    };
    if (wilayah_id) baseWhere.wilayah_id = wilayah_id;

    const total = await Hotspot.count({ where: baseWhere });

    // Breakdown per tingkat kepercayaan
    const breakdownRows = await Hotspot.findAll({
      where: baseWhere,
      attributes: ["confidence_level", [fn("COUNT", col("id")), "total"]],
      group: ["confidence_level"],
      raw: true,
    });
    const breakdown = { low: 0, medium: 0, high: 0 };
    for (const row of breakdownRows) {
      breakdown[row.confidence_level] = Number(row.total);
    }

    // Rekap per wilayah
    const perWilayahWhere = wilayah_id
      ? baseWhere // sudah difilter ke satu wilayah_id spesifik (otomatis bukan null)
      : { ...baseWhere, wilayah_id: { [Op.ne]: null } };

    const perWilayahRows = await Hotspot.findAll({
      where: perWilayahWhere,
      attributes: ["wilayah_id", [fn("COUNT", col("id")), "total"]],
      group: ["wilayah_id"],
      raw: true,
    });

    const wilayahIds = perWilayahRows
      .map((r) => r.wilayah_id)
      .filter((v) => v !== null);
    const wilayahRecords = wilayahIds.length
      ? await Wilayah.findAll({ where: { id: { [Op.in]: wilayahIds } } })
      : [];
    const wilayahById = new Map(wilayahRecords.map((w) => [w.id, w]));

    const perWilayah = perWilayahRows.map((row) => ({
      wilayah_id: row.wilayah_id,
      wilayah: wilayahById.has(row.wilayah_id)
        ? wilayahById.get(row.wilayah_id).label
        : null,
      total: Number(row.total),
    }));

    // Tren harian (untuk grafik)
    const trendRows = await Hotspot.findAll({
      where: baseWhere,
      attributes: ["acq_date", [fn("COUNT", col("id")), "total"]],
      group: ["acq_date"],
      order: [["acq_date", "ASC"]],
      raw: true,
    });
    const trend = trendRows.map((row) => ({
      date: row.acq_date,
      total: Number(row.total),
    }));

    return res.json({
      data: {
        total,
        confidence_breakdown: breakdown,
        per_wilayah: perWilayah,
        trend,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { index, indexValidators };
