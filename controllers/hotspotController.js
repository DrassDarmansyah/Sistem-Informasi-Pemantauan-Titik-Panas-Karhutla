const { Hotspot } = require('../models');

// GET /api/hotspots/:id
const getHotspotById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotspot = await Hotspot.findByPk(id);

    if (!hotspot) {
      return res.status(404).json({
        status: 'error',
        message: 'Titik panas dengan ID tersebut tidak ditemukan.'
      });
    }

    return res.status(200).json({ status: 'success', data: hotspot });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Gagal mengambil detail.', error: error.message });
  }
};

// GET /api/hotspots (Dengan Filter Sederhana)
const getHotspots = async (req, res) => {
  try {
    const { confidence } = req.query;
    let hotspots = await Hotspot.findAll();

    // Filter berdasarkan query confidence jika ada
    if (confidence) {
      hotspots = hotspots.filter(item => item.confidence.toLowerCase() === confidence.toLowerCase());
    }

    return res.status(200).json({ status: 'success', count: hotspots.length, data: hotspots });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Gagal mengambil data.', error: error.message });
  }
};

module.exports = { getHotspotById, getHotspots };