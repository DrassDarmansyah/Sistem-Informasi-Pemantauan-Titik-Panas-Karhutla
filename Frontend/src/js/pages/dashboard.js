import { ApiService } from '../api.js';
import { renderTrendChart } from '../components/chart.js';

export function renderDashboardPage(container) {
  container.innerHTML = `
    <div class="max-w-7xl mx-auto w-full py-8 px-4 space-y-8">

      <div class="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 class="text-3xl font-extrabold text-white">📊 Dashboard Rekap Operator</h1>
          <p class="text-gray-400 text-sm">Ringkasan titik panas dan agregasi berdasarkan wilayah</p>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
        <h3 class="text-lg font-bold text-gray-200 mb-4">📈 Tren Titik Panas dari Waktu ke Waktu</h3>
        <div class="h-72 w-full">
          <canvas id="trendChart"></canvas>
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 class="text-lg font-bold text-gray-200">📍 Rekapitulasi per Wilayah</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-300">
            <thead class="bg-gray-900 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th class="py-3 px-4">Wilayah</th>
                <th class="py-3 px-4">Total Titik Panas</th>
                <th class="py-3 px-4">Confidence HIGH</th>
                <th class="py-3 px-4">Confidence MEDIUM</th>
                <th class="py-3 px-4">Confidence LOW</th>
              </tr>
            </thead>
            <tbody id="summary-table-body" class="divide-y divide-gray-700">
              <tr><td colspan="5" class="py-4 text-center text-gray-500">Memuat rekapitulasi data...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Fetch Agregasi
  ApiService.getSummary()
    .then(data => {
      // 1. Render Chart
      if (data.trend) {
        renderTrendChart('trendChart', data.trend);
      }

      // 2. Render Table
      const tbody = document.getElementById('summary-table-body');
      if (data.regionalSummary && data.regionalSummary.length > 0) {
        tbody.innerHTML = data.regionalSummary.map(row => `
          <tr class="hover:bg-gray-750">
            <td class="py-3 px-4 font-semibold text-white">${row.nama_wilayah}</td>
            <td class="py-3 px-4 font-bold text-red-400">${row.total}</td>
            <td class="py-3 px-4 text-red-500">${row.high || 0}</td>
            <td class="py-3 px-4 text-yellow-500">${row.medium || 0}</td>
            <td class="py-3 px-4 text-blue-500">${row.low || 0}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-gray-400">Tidak ada data rekapitulasi.</td></tr>`;
      }
    })
    .catch(err => {
      alert("Gagal memuat dashboard operator: " + err.message);
    });
}