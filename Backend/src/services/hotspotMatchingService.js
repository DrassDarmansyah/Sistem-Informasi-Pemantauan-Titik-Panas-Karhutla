const { Op } = require("sequelize");
const { Wilayah, User } = require("../models");
const notificationDispatcher = require("./notificationDispatcher");

const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Cari wilayah yang titik tengahnya berada dalam radius_km masing-masing
 * dari lokasi hotspot, diurutkan dari yang paling dekat.
 */
async function findWilayahWithinRadius(lat, lon) {
  const allWilayah = await Wilayah.findAll();

  return allWilayah
    .map((w) => ({
      wilayah: w,
      distanceKm: haversineKm(lat, lon, w.latitude, w.longitude),
    }))
    .filter((row) => row.distanceKm <= row.wilayah.radius_km)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map((row) => row.wilayah);
}

/**
 * cocokkan titik panas baru
 * dengan wilayah terdaftar, simpan wilayah terdekat sebagai referensi, lalu
 * kirim notifikasi ke akun Warga di wilayah-wilayah yang cocok.
 */
async function matchAndNotify(hotspot) {
  const wilayahList = await findWilayahWithinRadius(
    hotspot.latitude,
    hotspot.longitude,
  );

  if (wilayahList.length === 0) return;

  hotspot.wilayah_id = wilayahList[0].id;
  await hotspot.save();

  const wilayahIds = wilayahList.map((w) => w.id);

  const users = await User.findAll({
    where: {
      role: User.ROLE_WARGA,
      wilayah_id: { [Op.in]: wilayahIds },
    },
  });

  for (const user of users) {
    await notificationDispatcher.send(user, hotspot);
  }

  console.log(
    `[HotspotMatchingService] Hotspot #${hotspot.id} cocok dengan ${wilayahList.length} wilayah, ` +
      `${users.length} akun Warga akan dinotifikasi.`,
  );
}

module.exports = { matchAndNotify, findWilayahWithinRadius, haversineKm };
