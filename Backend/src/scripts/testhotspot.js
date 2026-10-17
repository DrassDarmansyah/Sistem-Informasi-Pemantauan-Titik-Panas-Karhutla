require("dotenv").config();
const { Op } = require("sequelize");
const { Hotspot, Wilayah, NotificationLog } = require("../models");
const hotspotMatchingService = require("../services/hotspotMatchingService");

// Satu wilayah (disarankan) : node src/scripts/testhotspot.js Betara
// Semua wilayah             : node src/scripts/testhotspot.js --semua
// Hapus semua data uji      : node src/scripts/testhotspot.js --hapus
// Menyalakan pengambilan data FIRMS secara manual: npm run fetch:hotspots

const MARKER = "TEST_SCRIPT";

// Titik acak di dalam 80% radius wilayah (sisakan margin supaya pasti terkena).
function titikAcak(w) {
  const lat0 = Number(w.latitude); // DECIMAL dari Sequelize berupa string
  const lon0 = Number(w.longitude);
  const radius = Number(w.radius_km);
  const jarakKm = Math.sqrt(Math.random()) * radius * 0.8;
  const sudut = Math.random() * 2 * Math.PI;
  const dLat = (jarakKm * Math.cos(sudut)) / 111.32;
  const dLon =
    (jarakKm * Math.sin(sudut)) / (111.32 * Math.cos((lat0 * Math.PI) / 180));
  return {
    latitude: Number((lat0 + dLat).toFixed(5)),
    longitude: Number((lon0 + dLon).toFixed(5)),
    jarakKm,
  };
}

async function hapusDataUji() {
  const uji = await Hotspot.findAll({
    where: { dedup_key: { [Op.like]: "test-%" } },
    attributes: ["id"],
  });
  const ids = uji.map((h) => h.id);
  if (ids.length === 0) {
    console.log("Tidak ada data uji.");
    return;
  }
  const log = await NotificationLog.destroy({ where: { hotspot_id: ids } });
  const n = await Hotspot.destroy({ where: { id: ids } });
  console.log(`Dihapus: ${n} hotspot uji dan ${log} catatan notifikasi.`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--hapus")) {
    await hapusDataUji();
    return;
  }

  const keyword = (args.find((a) => !a.startsWith("--")) || "").toLowerCase();
  const semuaWilayah = await Wilayah.findAll({ order: [["id", "ASC"]] });
  const target = keyword
    ? semuaWilayah.filter((w) => w.nama.toLowerCase().includes(keyword))
    : semuaWilayah;

  if (target.length === 0) {
    console.log(
      keyword
        ? `Tidak ada wilayah yang cocok dengan "${keyword}".`
        : "Tabel wilayah kosong. Jalankan npm run db:seed.",
    );
    return;
  }

  if (!keyword && !args.includes("--semua")) {
    console.log(
      "Tanpa nama wilayah, skrip membuat satu titik uji untuk SETIAP wilayah dan\n" +
        "dapat mengirim email ke banyak akun. Beri nama wilayah, atau tambahkan --semua.",
    );
    return;
  }

  for (const w of target) {
    const p = titikAcak(w);

    const hotspot = await Hotspot.create({
      latitude: p.latitude,
      longitude: p.longitude,
      confidence_level: "high",
      acq_date: new Date().toISOString().split("T")[0],
      acq_time: new Date().toTimeString().slice(0, 5).replace(":", ""), // jam lokal
      detected_at: new Date(),
      source: MARKER,
      dedup_key: `test-${w.nama}-${Date.now()}`,
    });

    await hotspotMatchingService.matchAndNotify(hotspot);
    console.log(
      `Hotspot #${hotspot.id} di ${w.nama} (${p.latitude}, ${p.longitude}), ±${p.jarakKm.toFixed(1)} km dari pusat.`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());

// require("dotenv").config();
// const { Hotspot } = require("../models");
// const hotspotMatchingService = require("../services/hotspotMatchingService");

// // Semua wilayah:      node src/scripts/testhotspot.js
// // Satu wilayah saja:  node src/scripts/testhotspot.js Pelalawan
// // untuk menyalakan manual pengambilan data fetch dari firms : npm run fetch:hotspots

// // Titik tengah + radius sama dengan seed.js
// const titik = [
//   { nama: "Mandiangin", latitude: -2.11, longitude: 103.0522, radius_km: 18.9 },
//   { nama: "Betara", latitude: -1.0944, longitude: 103.3708, radius_km: 12.8 },
//   {
//     nama: "Ketungau Tengah",
//     latitude: 0.7568,
//     longitude: 111.4599,
//     radius_km: 25.3,
//   },
//   {
//     nama: "Kendawangan",
//     latitude: -2.6263,
//     longitude: 110.527,
//     radius_km: 40.4,
//   },
//   {
//     nama: "Daha Selatan",
//     latitude: -2.6549,
//     longitude: 115.12,
//     radius_km: 9.2,
//   },
//   {
//     nama: "Tapin Selatan",
//     latitude: -3.034,
//     longitude: 115.0899,
//     radius_km: 7.4,
//   },
//   { nama: "Lahei", latitude: -0.5783, longitude: 115.1702, radius_km: 30.4 },
//   {
//     nama: "Sebangau Kuala",
//     latitude: -2.8365,
//     longitude: 113.8368,
//     radius_km: 38.5,
//   },
//   {
//     nama: "Medang Kampai",
//     latitude: 1.5931,
//     longitude: 101.6029,
//     radius_km: 10.6,
//   },
//   {
//     nama: "Teluk Meranti",
//     latitude: 0.3832,
//     longitude: 102.6687,
//     radius_km: 36.2,
//   },
//   {
//     nama: "Rawas Ilir",
//     latitude: -2.6193,
//     longitude: 103.1746,
//     radius_km: 17.9,
//   },
//   {
//     nama: "Muara Lakitan",
//     latitude: -3.1449,
//     longitude: 103.419,
//     radius_km: 24.1,
//   },
// ];

// // Titik acak di dalam 80% radius wilayah (sisakan margin supaya pasti terkena).
// function titikAcak(t) {
//   const jarakKm = Math.sqrt(Math.random()) * t.radius_km * 0.8;
//   const sudut = Math.random() * 2 * Math.PI;
//   const dLat = (jarakKm * Math.cos(sudut)) / 111.32;
//   const dLon =
//     (jarakKm * Math.sin(sudut)) /
//     (111.32 * Math.cos((t.latitude * Math.PI) / 180));
//   return {
//     latitude: Number((t.latitude + dLat).toFixed(5)),
//     longitude: Number((t.longitude + dLon).toFixed(5)),
//     jarakKm,
//   };
// }

// async function main() {
//   const keyword = (process.argv[2] || "").toLowerCase();
//   const target = keyword
//     ? titik.filter((t) => t.nama.toLowerCase().includes(keyword))
//     : titik;

//   if (target.length === 0) {
//     console.log(`Tidak ada wilayah yang cocok dengan "${keyword}".`);
//     return;
//   }

//   for (const t of target) {
//     const p = titikAcak(t);

//     const hotspot = await Hotspot.create({
//       latitude: p.latitude,
//       longitude: p.longitude,
//       confidence_level: "high",
//       acq_date: new Date().toISOString().split("T")[0],
//       acq_time: new Date().toTimeString().slice(0, 5).replace(":", ""),
//       detected_at: new Date(),
//       dedup_key: `test-${t.nama}-${Date.now()}`,
//     });

//     await hotspotMatchingService.matchAndNotify(hotspot);
//     console.log(
//       `Hotspot #${hotspot.id} di ${t.nama} (${p.latitude}, ${p.longitude}), ±${p.jarakKm.toFixed(1)} km dari pusat.`,
//     );
//   }
// }

// main()
//   .catch(console.error)
//   .finally(() => process.exit());

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
