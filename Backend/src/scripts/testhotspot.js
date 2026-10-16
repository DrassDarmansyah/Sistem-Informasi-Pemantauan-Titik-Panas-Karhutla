require("dotenv").config();
const { Hotspot } = require("../models");
const hotspotMatchingService = require("../services/hotspotMatchingService");

// Semua wilayah:      node src/scripts/testhotspot.js
// Satu wilayah saja:  node src/scripts/testhotspot.js Pelalawan
// untuk menyalakan manual pengambilan data fetch dari firms : npm run fetch:hotspots

// Titik tengah + radius sama dengan seed.js
const titik = [
  { nama: "Pelalawan", latitude: 0.2278, longitude: 101.9433, radius_km: 25 },
  { nama: "Bengkalis", latitude: 1.4553, longitude: 102.0987, radius_km: 25 },
  { nama: "Rimbo Ilir", latitude: -1.439, longitude: 102.281, radius_km: 25 },
  {
    nama: "Ogan Komering Ilir",
    latitude: -3.1667,
    longitude: 104.95,
    radius_km: 30,
  },
  { nama: "Kubu Raya", latitude: -0.0989, longitude: 109.4319, radius_km: 25 },
  {
    nama: "Pulang Pisau",
    latitude: -2.8747,
    longitude: 114.0125,
    radius_km: 30,
  },
  { nama: "Bagan Sinembah", latitude: 1.7, longitude: 100.6, radius_km: 30 },
  { nama: "Sungai Lilin", latitude: -2.8333, longitude: 104.0, radius_km: 30 },
  {
    nama: "Muara Sabak Timur",
    latitude: -1.05,
    longitude: 103.95,
    radius_km: 30,
  },
  { nama: "Delta Pawan", latitude: -1.85, longitude: 109.9667, radius_km: 30 },
  { nama: "Baamang", latitude: -2.5333, longitude: 112.95, radius_km: 30 },
  { nama: "Kandangan", latitude: -2.7667, longitude: 115.2667, radius_km: 25 },
];

// Titik acak di dalam 80% radius wilayah (sisakan margin supaya pasti terkena).
function titikAcak(t) {
  const jarakKm = Math.sqrt(Math.random()) * t.radius_km * 0.8;
  const sudut = Math.random() * 2 * Math.PI;
  const dLat = (jarakKm * Math.cos(sudut)) / 111.32;
  const dLon =
    (jarakKm * Math.sin(sudut)) /
    (111.32 * Math.cos((t.latitude * Math.PI) / 180));
  return {
    latitude: Number((t.latitude + dLat).toFixed(5)),
    longitude: Number((t.longitude + dLon).toFixed(5)),
    jarakKm,
  };
}

async function main() {
  const keyword = (process.argv[2] || "").toLowerCase();
  const target = keyword
    ? titik.filter((t) => t.nama.toLowerCase().includes(keyword))
    : titik;

  if (target.length === 0) {
    console.log(`Tidak ada wilayah yang cocok dengan "${keyword}".`);
    return;
  }

  for (const t of target) {
    const p = titikAcak(t);

    const hotspot = await Hotspot.create({
      latitude: p.latitude,
      longitude: p.longitude,
      confidence_level: "high",
      acq_date: new Date().toISOString().split("T")[0],
      acq_time: new Date().toTimeString().slice(0, 5).replace(":", ""),
      detected_at: new Date(),
      dedup_key: `test-${t.nama}-${Date.now()}`,
    });

    await hotspotMatchingService.matchAndNotify(hotspot);
    console.log(
      `Hotspot #${hotspot.id} di ${t.nama} (${p.latitude}, ${p.longitude}), ±${p.jarakKm.toFixed(1)} km dari pusat.`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());

// require("dotenv").config();
// const { Hotspot } = require("../models");
// const hotspotMatchingService = require("../services/hotspotMatchingService");

// //menjalankan : node src/scripts/testhotspot.js

// async function main() {
//   const hotspot = await Hotspot.create({
//     latitude: 1.6,
//     longitude: 102.2,
//     confidence_level: "high",
//     acq_date: new Date().toISOString().split("T")[0],
//     acq_time: new Date().toTimeString().slice(0, 5).replace(":", ""),
//     detected_at: new Date(),
//     dedup_key: `test-${Date.now()}`,
//   });

//   await hotspotMatchingService.matchAndNotify(hotspot);

//   console.log("Hotspot berhasil dibuat:", hotspot.id);
// }

// main()
//   .catch(console.error)
//   .finally(() => process.exit());
