require("dotenv").config();
const { sequelize } = require("../models");

async function main() {
  console.log("Menyiapkan tabel database...");
  // alter:true supaya perubahan kolom pada model ikut disesuaikan saat re-run.
  await sequelize.sync({ alter: true });
  console.log("Selesai. Semua tabel sudah siap.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
