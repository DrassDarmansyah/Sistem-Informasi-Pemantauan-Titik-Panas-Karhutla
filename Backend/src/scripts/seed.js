require("dotenv").config();
const { Wilayah, User } = require("../models");
const passwordUtil = require("../utils/password");

const wilayahData = [
  {
    nama: "Kec. Mandiangin",
    kabupaten: "Sarolangun",
    provinsi: "Jambi",
    latitude: -2.11,
    longitude: 103.0522,
    radius_km: 18.9,
  },
  {
    nama: "Kec. Betara",
    kabupaten: "Tanjung Jabung Barat",
    provinsi: "Jambi",
    latitude: -1.0944,
    longitude: 103.3708,
    radius_km: 12.8,
  },
  {
    nama: "Kec. Ketungau Tengah",
    kabupaten: "Sintang",
    provinsi: "Kalimantan Barat",
    latitude: 0.7568,
    longitude: 111.4599,
    radius_km: 25.3,
  },
  {
    nama: "Kec. Kendawangan",
    kabupaten: "Ketapang",
    provinsi: "Kalimantan Barat",
    latitude: -2.6263,
    longitude: 110.527,
    radius_km: 40.4,
  },
  {
    nama: "Kec. Daha Selatan",
    kabupaten: "Hulu Sungai Selatan",
    provinsi: "Kalimantan Selatan",
    latitude: -2.6549,
    longitude: 115.12,
    radius_km: 9.2,
  },
  {
    nama: "Kec. Tapin Selatan",
    kabupaten: "Tapin",
    provinsi: "Kalimantan Selatan",
    latitude: -3.034,
    longitude: 115.0899,
    radius_km: 7.4,
  },
  {
    nama: "Kec. Lahei",
    kabupaten: "Barito Utara",
    provinsi: "Kalimantan Tengah",
    latitude: -0.5783,
    longitude: 115.1702,
    radius_km: 30.4,
  },
  {
    nama: "Kec. Sebangau Kuala",
    kabupaten: "Pulang Pisau",
    provinsi: "Kalimantan Tengah",
    latitude: -2.8365,
    longitude: 113.8368,
    radius_km: 38.5,
  },
  {
    nama: "Kec. Medang Kampai",
    kabupaten: "Kota Dumai",
    provinsi: "Riau",
    latitude: 1.5931,
    longitude: 101.6029,
    radius_km: 10.6,
  },
  {
    nama: "Kec. Teluk Meranti",
    kabupaten: "Pelalawan",
    provinsi: "Riau",
    latitude: 0.3832,
    longitude: 102.6687,
    radius_km: 36.2,
  },
  {
    nama: "Kec. Rawas Ilir",
    kabupaten: "Musi Rawas Utara",
    provinsi: "Sumatera Selatan",
    latitude: -2.6193,
    longitude: 103.1746,
    radius_km: 17.9,
  },
  {
    nama: "Kec. Muara Lakitan",
    kabupaten: "Musi Rawas",
    provinsi: "Sumatera Selatan",
    latitude: -3.1449,
    longitude: 103.419,
    radius_km: 24.1,
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
