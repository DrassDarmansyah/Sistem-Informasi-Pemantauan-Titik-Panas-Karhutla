const { Hotspot } = require("../models");

async function index(req, res, next) {
  try {
    const hotspots = await Hotspot.findAll({
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

module.exports = { index };
