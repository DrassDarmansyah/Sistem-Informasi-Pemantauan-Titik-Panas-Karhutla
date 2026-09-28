require("dotenv").config();
const firmsService = require("../services/firmsService");

/**
 * Jalankan manual: npm run fetch:hotspots
 */
async function main() {
  console.log("Mengambil data titik panas dari NASA FIRMS...");

  const stats = await firmsService.fetchAndStore();

  console.table([stats]);
  console.log("Selesai.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
