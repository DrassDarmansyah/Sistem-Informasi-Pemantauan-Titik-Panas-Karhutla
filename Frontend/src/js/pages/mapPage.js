import { HotspotMap } from "../components/map.js";
import { ApiService } from "../api.js";

export function renderMapPage(container) {
  container.innerHTML = `
    <div class="flex flex-col h-full flex-1">

      <!-- Filter Bar [No. 16] -->
      <div class="bg-gray-800 border-b border-gray-700 p-4 shadow-md">
        <form id="filter-form" class="max-w-7xl mx-auto flex flex-wrap items-center gap-4">

          <div class="flex flex-col">
            <label class="text-xs text-gray-400 font-medium mb-1">Tanggal Mulai</label>
            <input type="date" id="start_date" class="bg-gray-900 border border-gray-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-red-500">
          </div>

          <div class="flex flex-col">
            <label class="text-xs text-gray-400 font-medium mb-1">Tanggal Akhir</label>
            <input type="date" id="end_date" class="bg-gray-900 border border-gray-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-red-500">
          </div>

          <div class="flex flex-col">
            <label class="text-xs text-gray-400 font-medium mb-1">Tingkat Kepercayaan</label>
            <select id="confidence" class="bg-gray-900 border border-gray-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-red-500">
              <option value="">Semua</option>
              <option value="low">Rendah (LOW)</option>
              <option value="medium">Sedang (MEDIUM)</option>
              <option value="high">Tinggi (HIGH)</option>
            </select>
          </div>

          <div class="flex items-end gap-2 mt-auto">
            <button type="submit" id="btn-submit" class="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-1.5 rounded transition">
              Terapkan Filter
            </button>
            <button type="button" id="btn-reset" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold px-4 py-1.5 rounded transition">
              Reset
            </button>
          </div>

          <!-- Loading Indicator -->
          <div id="filter-loading" class="hidden items-center ml-auto text-yellow-500 text-sm font-medium animate-pulse">
            ⏳ Memuat data...
          </div>

        </form>
      </div>

      <!-- Main Map Element [No. 3] -->
      <div id="main-map" class="flex-1 w-full min-h-[500px]"></div>

    </div>
  `;

  const mapComponent = new HotspotMap("main-map");
  mapComponent.init();

  const loadMapData = (filters = {}) => {
    const loadingEl = document.getElementById("filter-loading");
    loadingEl.classList.remove("hidden");
    loadingEl.classList.add("flex");

    ApiService.getHotspots(filters)
      .then((data) => {
        mapComponent.renderHotspots(data);
        mapComponent.invalidateSize();
      })
      .catch((err) => alert("Gagal mengambil data titik panas: " + err.message))
      .finally(() => {
        loadingEl.classList.add("hidden");
        loadingEl.classList.remove("flex");
      });
  };

  // Initial Load
  loadMapData();

  // Handle Filter Submit
  document.getElementById("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const startDate = document.getElementById("start_date").value;
    const endDate = document.getElementById("end_date").value;
    const confidence = document.getElementById("confidence").value;

    const filters = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (confidence) filters.confidence = confidence;

    loadMapData(filters);
  });

  // Handle Reset Filter
  document.getElementById("btn-reset").addEventListener("click", () => {
    document.getElementById("start_date").value = "";
    document.getElementById("end_date").value = "";
    document.getElementById("confidence").value = "";
    loadMapData();
  });
}
