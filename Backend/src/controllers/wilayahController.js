const { Wilayah } = require("../models");

async function index(req, res, next) {
  try {
    const wilayahList = await Wilayah.findAll({
      order: [
        ["provinsi", "ASC"],
        ["kabupaten", "ASC"],
        ["nama", "ASC"],
      ],
      attributes: ["id", "nama", "kabupaten", "provinsi"],
    });

    return res.json({
      data: wilayahList.map((w) => ({
        id: w.id,
        nama: w.nama,
        label: w.label, // "Kec. Pelalawan, Pelalawan, Riau" siap pakai di dropdown
      })),
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { index };
