require("dotenv").config();
const { Wilayah, User } = require("../models");
const passwordUtil = require("../utils/password");

const wilayahData = [
  {
    nama: "Kec. Pelalawan",
    kabupaten: "Pelalawan",
    provinsi: "Riau",
    latitude: 0.2278,
    longitude: 101.9433,
    radius_km: 25,
  },
  {
    nama: "Kec. Bengkalis",
    kabupaten: "Bengkalis",
    provinsi: "Riau",
    latitude: 1.4553,
    longitude: 102.0987,
    radius_km: 25,
  },
  {
    nama: "Kec. Rimbo Ilir",
    kabupaten: "Tebo",
    provinsi: "Jambi",
    latitude: -1.439,
    longitude: 102.281,
    radius_km: 25,
  },
  {
    nama: "Kec. Ogan Komering Ilir",
    kabupaten: "OKI",
    provinsi: "Sumatera Selatan",
    latitude: -3.1667,
    longitude: 104.95,
    radius_km: 30,
  },
  {
    nama: "Kec. Kubu Raya",
    kabupaten: "Kubu Raya",
    provinsi: "Kalimantan Barat",
    latitude: -0.0989,
    longitude: 109.4319,
    radius_km: 25,
  },
  {
    nama: "Kec. Pulang Pisau",
    kabupaten: "Pulang Pisau",
    provinsi: "Kalimantan Tengah",
    latitude: -2.8747,
    longitude: 114.0125,
    radius_km: 30,
  },
  {
    nama: "Kec. Bagan Sinembah",
    kabupaten: "Rokan Hilir",
    provinsi: "Riau",
    latitude: 1.7,
    longitude: 100.6,
    radius_km: 30,
  },
  {
    nama: "Kec. Sungai Lilin",
    kabupaten: "Musi Banyuasin",
    provinsi: "Sumatera Selatan",
    latitude: -2.8333,
    longitude: 104.0,
    radius_km: 30,
  },
  {
    nama: "Kec. Muara Sabak Timur",
    kabupaten: "Tanjung Jabung Timur",
    provinsi: "Jambi",
    latitude: -1.05,
    longitude: 103.95,
    radius_km: 30,
  },
  {
    nama: "Kec. Delta Pawan",
    kabupaten: "Ketapang",
    provinsi: "Kalimantan Barat",
    latitude: -1.85,
    longitude: 109.9667,
    radius_km: 30,
  },
  {
    nama: "Kec. Baamang",
    kabupaten: "Kotawaringin Timur",
    provinsi: "Kalimantan Tengah",
    latitude: -2.5333,
    longitude: 112.95,
    radius_km: 30,
  },
  {
    nama: "Kec. Kandangan",
    kabupaten: "Hulu Sungai Selatan",
    provinsi: "Kalimantan Selatan",
    latitude: -2.7667,
    longitude: 115.2667,
    radius_km: 25,
  },
];

async function seedWilayah() {
  for (const row of wilayahData) {
    const [record] = await Wilayah.findOrCreate({
      where: { nama: row.nama, kabupaten: row.kabupaten },
      defaults: row,
    });
    await record.update(row);
  }
  console.log(`Wilayah: ${wilayahData.length} baris disiapkan.`);
}

async function seedOperators() {
  const hashed = await passwordUtil.hash("password123");

  const operators = [
    { email: "damkar.demo@karhutla.local", name: "Operator Damkar (Demo)" },
    { email: "polisi.demo@karhutla.local", name: "Operator Kepolisian (Demo)" },
  ];

  for (const op of operators) {
    const [record] = await User.findOrCreate({
      where: { email: op.email },
      defaults: { ...op, password: hashed, role: User.ROLE_OPERATOR },
    });
    await record.update({
      name: op.name,
      password: hashed,
      role: User.ROLE_OPERATOR,
    });
  }
  console.log(
    `Operator demo: ${operators.length} akun disiapkan (password: password123).`,
  );
}

async function main() {
  await seedWilayah();
  await seedOperators();
  console.log("Seeding selesai.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
