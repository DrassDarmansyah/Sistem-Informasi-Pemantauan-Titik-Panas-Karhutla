require("dotenv").config();
const { Hotspot } = require("../models");
const hotspotMatchingService = require("../services/hotspotMatchingService");

//menjalankan : node src/scripts/testhotspot.js

async function main() {
  const hotspot = await Hotspot.create({
    latitude: 1.6,
    longitude: 102.2,
    confidence_level: "high",
    acq_date: new Date().toISOString().split("T")[0],
    acq_time: new Date().toTimeString().slice(0, 5).replace(":", ""),
    detected_at: new Date(),
    dedup_key: `test-${Date.now()}`,
  });

  await hotspotMatchingService.matchAndNotify(hotspot);

  console.log("Hotspot berhasil dibuat:", hotspot.id);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
