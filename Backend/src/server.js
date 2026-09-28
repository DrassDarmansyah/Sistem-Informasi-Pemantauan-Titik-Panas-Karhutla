require("dotenv").config();

const cron = require("node-cron");
const createApp = require("./app");
const { sequelize, PersonalAccessToken } = require("./models");
const { Op } = require("sequelize");
const firmsService = require("./services/firmsService");

const PORT = process.env.PORT || 8000;

let fetchingHotspots = false;

function scheduleFetchHotspots() {
  cron.schedule("*/30 * * * *", async () => {
    if (fetchingHotspots) {
      console.log(
        "[scheduler] hotspots:fetch masih berjalan, lewati jadwal ini (withoutOverlapping).",
      );
      return;
    }
    fetchingHotspots = true;
    try {
      await firmsService.fetchAndStore();
    } catch (e) {
      console.error("[scheduler] hotspots:fetch gagal:", e);
    } finally {
      fetchingHotspots = false;
    }
  });
}

/**
 * Hapus token yang sudah kedaluwarsa lebih dari 24 jam yang lalu.
 */
function schedulePruneExpiredTokens() {
  cron.schedule("0 0 * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const deleted = await PersonalAccessToken.destroy({
        where: { expires_at: { [Op.lt]: cutoff } },
      });
      console.log(
        `[scheduler] sanctum:prune-expired — ${deleted} token dihapus.`,
      );
    } catch (e) {
      console.error("[scheduler] prune-expired gagal:", e);
    }
  });
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil.");
  } catch (e) {
    console.error("Gagal konek ke database:", e.message);
    process.exit(1);
  }

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Karhutla backend (Express) berjalan di port ${PORT}`);
  });

  scheduleFetchHotspots();
  schedulePruneExpiredTokens();
}

start();
