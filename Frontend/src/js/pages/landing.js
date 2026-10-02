import { HotspotMap } from '../components/map.js';
import { ApiService } from '../api.js';

export function renderLandingPage(container) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-10 px-4 max-w-5xl mx-auto text-center space-y-8">

      <!-- Hero Section -->
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Sistem Deteksi & Dini Kebakaran Hutan VINIX7
        </h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          VINIX7 memantau titik panas karhutla secara real-time dari data satelit dan memberikan notifikasi peringatan dini otomatis kepada warga di wilayah terdampak.
        </p>
      </div>

      <!-- CTA Buttons -->
      <div class="flex space-x-4">
        <a href="#/register" class="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg transition">
          Daftar Akun Warga
        </a>
        <a href="#/login" class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-bold px-6 py-3 rounded-lg transition">
          Masuk (Login)
        </a>
      </div>

      <!-- Preview Map Container [Medium Size] -->
      <div class="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-2xl space-y-3">
        <div class="flex justify-between items-center text-left px-2">
          <h3 class="font-bold text-gray-200">📍 Pratinjau Sebaran Titik Panas Terkini</h3>
          <a href="#/map" class="text-sm text-red-400 hover:underline">Lihat Peta Penuh &rarr;</a>
        </div>
        <div id="map-preview" class="h-80 w-full rounded-lg overflow-hidden"></div>
      </div>

    </div>
  `;

  // Initialize Map
  const mapComponent = new HotspotMap('map-preview', { zoom: 4 });
  mapComponent.init();

  // Load Initial Data
  ApiService.getHotspots()
    .then(data => {
      mapComponent.renderHotspots(data);
      mapComponent.invalidateSize();
    })
    .catch(err => console.error("Error loading preview hotspots:", err));
}