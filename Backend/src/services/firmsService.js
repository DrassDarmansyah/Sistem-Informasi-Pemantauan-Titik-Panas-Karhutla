const axios = require("axios");
const crypto = require("crypto");
const { DateTime } = require("luxon");
const { Hotspot } = require("../models");
const hotspotMatchingService = require("./hotspotMatchingService");

const BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api";

function resolveEndpointSegment(area) {
  return area.includes(",") ? "area" : "country";
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCsv(csv) {
  const lines = csv
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const rows = [];

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    if (cols.length !== header.length) continue; // baris rusak/tidak lengkap

    const row = {};
    header.forEach((key, idx) => {
      row[key] = cols[idx];
    });
    rows.push(row);
  }

  return rows;
}

/**
 * FIRMS punya 2 format confidence tergantung sensor:
 * - VIIRS: string "l" / "n" / "h" (low/nominal/high) atau kata penuh
 * - MODIS: angka 0-100
 * Dipetakan ke enum low/medium/high.
 */
function mapConfidenceLevel(raw) {
  const value = String(raw).toLowerCase().trim();

  if (value !== "" && !isNaN(Number(value))) {
    const num = Number(value);
    if (num >= 80) return Hotspot.CONF_HIGH;
    if (num >= 30) return Hotspot.CONF_MEDIUM;
    return Hotspot.CONF_LOW;
  }

  if (value.startsWith("h")) return Hotspot.CONF_HIGH;
  if (value.startsWith("l")) return Hotspot.CONF_LOW;
  return Hotspot.CONF_MEDIUM; // "n" (nominal) & lainnya
}

function isNumeric(v) {
  return v !== null && v !== undefined && v !== "" && !isNaN(Number(v));
}

/**
 * Validasi field wajib lalu ubah ke bentuk siap simpan ke tabel hotspots.
 * Mengembalikan null jika baris tidak valid (baris dilewati).
 */
function validateAndTransform(row) {
  const lat = row.latitude;
  const lon = row.longitude;
  const acqDate = row.acq_date;
  let acqTime = row.acq_time;
  const confRaw = row.confidence;

  if (
    !isNumeric(lat) ||
    !isNumeric(lon) ||
    !acqDate ||
    acqTime === undefined ||
    confRaw === undefined
  ) {
    return null;
  }

  acqTime = String(acqTime).padStart(4, "0"); // FIRMS kirim "512" -> "0512"

  const detectedAt = DateTime.fromFormat(
    `${acqDate} ${acqTime}`,
    "yyyy-MM-dd HHmm",
    {
      zone: "utc",
    },
  );

  if (!detectedAt.isValid) return null;

  const latRounded = Math.round(Number(lat) * 1e5) / 1e5;
  const lonRounded = Math.round(Number(lon) * 1e5) / 1e5;
  const satellite = row.satellite || "";

  const dedupKey = crypto
    .createHash("sha256")
    .update(`${latRounded}|${lonRounded}|${acqDate}|${acqTime}|${satellite}`)
    .digest("hex");

  return {
    latitude: latRounded,
    longitude: lonRounded,
    brightness: isNumeric(row.bright_ti4) ? Number(row.bright_ti4) : null,
    frp: isNumeric(row.frp) ? Number(row.frp) : null,
    satellite: satellite || null,
    confidence_raw: String(confRaw),
    confidence_level: mapConfidenceLevel(confRaw),
    acq_date: acqDate,
    acq_time: acqTime,
    detected_at: detectedAt.toJSDate(),
    source: "NASA_FIRMS",
    dedup_key: dedupKey,
  };
}

/**
 * Ambil data dari FIRMS, memvalidasi, menyimpan yang baru (skip duplikat),
 * lalu menjalankan proses matching wilayah untuk tiap hotspot baru.
 */
async function fetchAndStore() {
  const mapKey = process.env.FIRMS_MAP_KEY;
  const source = process.env.FIRMS_SOURCE || "VIIRS_SNPP_NRT";
  const area = process.env.FIRMS_AREA || "IDN";
  const dayRange = process.env.FIRMS_DAY_RANGE || 1;

  const stats = { fetched: 0, saved: 0, duplicate: 0, invalid: 0 };

  if (!mapKey) {
    console.error(
      "[FirmsService] FIRMS_MAP_KEY belum diset di .env — job dilewati.",
    );
    return stats;
  }

  const endpoint = resolveEndpointSegment(area);
  const url = `${BASE_URL}/${endpoint}/csv/${mapKey}/${source}/${area}/${dayRange}`;

  let response;
  try {
    response = await axios.get(url, {
      timeout: 30000,
      validateStatus: () => true,
    });
  } catch (e) {
    // AC Story #2: jika request gagal, catat log error, job tetap jalan di jadwal berikutnya
    console.error(`[FirmsService] Gagal menghubungi NASA FIRMS: ${e.message}`);
    return stats;
  }

  if (response.status < 200 || response.status >= 300) {
    console.error(
      `[FirmsService] NASA FIRMS merespon status ${response.status}: ${response.data}`,
    );
    return stats;
  }

  const rows = parseCsv(String(response.data));
  stats.fetched = rows.length;

  for (const row of rows) {
    const validated = validateAndTransform(row);

    if (!validated) {
      stats.invalid++;
      continue;
    }

    const existing = await Hotspot.findOne({
      where: { dedup_key: validated.dedup_key },
    });
    if (existing) {
      stats.duplicate++;
      continue;
    }

    const hotspot = await Hotspot.create(validated);
    stats.saved++;

    // Story #7: cocokkan hotspot baru ini dengan wilayah & akun Warga terdaftar
    await hotspotMatchingService.matchAndNotify(hotspot);
  }

  console.log("[FirmsService] Selesai fetch: " + JSON.stringify(stats));

  return stats;
}

module.exports = {
  fetchAndStore,
  parseCsv,
  mapConfidenceLevel,
  validateAndTransform,
};
