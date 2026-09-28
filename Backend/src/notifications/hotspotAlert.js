const { DateTime } = require("luxon");

function formatWaktuWib(detectedAt) {
  return (
    DateTime.fromJSDate(new Date(detectedAt), { zone: "utc" })
      .setZone("Asia/Jakarta")
      .setLocale("id")
      .toFormat("dd MMM yyyy HH:mm") + " WIB"
  );
}

function buildHotspotAlert(user, hotspot) {
  const waktu = formatWaktuWib(hotspot.detected_at);
  const confidenceLabel =
    hotspot.confidence_level.charAt(0).toUpperCase() +
    hotspot.confidence_level.slice(1);

  const subject =
    "Peringatan Dini Karhutla — Titik Panas Terdeteksi di Wilayah Anda";

  const plainText =
    `[PERINGATAN KARHUTLA] Titik panas terdeteksi di ${hotspot.latitude},${hotspot.longitude} ` +
    `pada ${waktu}. Tingkat kepercayaan: ${hotspot.confidence_level}.`;

  const appUrl = process.env.APP_URL || "http://localhost:8000";

  const html = `
    <p>Halo ${user.name},</p>
    <p>Sistem mendeteksi titik panas baru di dekat wilayah notifikasi Anda.</p>
    <p>Lokasi: ${hotspot.latitude}, ${hotspot.longitude}</p>
    <p>Waktu deteksi: ${waktu}</p>
    <p>Tingkat kepercayaan: ${confidenceLabel}</p>
    <p>Mohon tetap waspada dan pantau perkembangan melalui peta pemantauan.</p>
    <p><a href="${appUrl}/peta">Lihat Peta Pemantauan</a></p>
    <p>Ini adalah notifikasi otomatis dari Sistem Pemantauan Karhutla.</p>
  `;

  const text =
    `Halo ${user.name},\n\n` +
    `Sistem mendeteksi titik panas baru di dekat wilayah notifikasi Anda.\n` +
    `Lokasi: ${hotspot.latitude}, ${hotspot.longitude}\n` +
    `Waktu deteksi: ${waktu}\n` +
    `Tingkat kepercayaan: ${confidenceLabel}\n\n` +
    `Mohon tetap waspada dan pantau perkembangan melalui peta pemantauan: ${appUrl}/peta\n\n` +
    `Ini adalah notifikasi otomatis dari Sistem Pemantauan Karhutla.`;

  return { subject, text, html, plainText };
}

module.exports = { buildHotspotAlert };
