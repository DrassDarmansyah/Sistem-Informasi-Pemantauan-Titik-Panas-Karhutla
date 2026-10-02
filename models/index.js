// Mock Model sederhana agar server berjalan tanpa koneksi database langsung
const Hotspot = {
  findByPk: async (id) => {
    if (id === '1') {
      return { id: 1, latitude: -2.5, longitude: 118.0, confidence: 'high', detection_time: new Date() };
    }
    return null;
  },
  findAll: async (options) => {
    return [
      { id: 1, latitude: -2.5, longitude: 118.0, confidence: 'high', detection_time: new Date() },
      { id: 2, latitude: -0.9, longitude: 113.9, confidence: 'nominal', detection_time: new Date() }
    ];
  }
};

module.exports = { Hotspot };
