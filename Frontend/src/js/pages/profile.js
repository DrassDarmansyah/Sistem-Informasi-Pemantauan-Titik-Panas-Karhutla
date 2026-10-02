import { ApiService } from "../api.js";
import { Store } from "../store.js";

export function renderProfilePage(container) {
  container.innerHTML = `
    <div class="max-w-xl mx-auto w-full py-12 px-4">
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl space-y-6">

        <h2 class="text-2xl font-bold text-white border-b border-gray-700 pb-3">
          ⚙️ Pengaturan Profil & Notifikasi
        </h2>

        <div id="profile-alert" class="hidden p-3 rounded text-sm font-medium"></div>

        <form id="profile-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="text" id="profile-email" disabled class="w-full bg-gray-900 border border-gray-700 text-gray-400 rounded px-3 py-2 text-sm cursor-not-allowed">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Wilayah Notifikasi Peringatan Dini</label>
            <select id="profile-wilayah" class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
              <option value="">Memuat wilayah...</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Anda akan menerima email otomatis saat ada titik panas baru di wilayah ini.</p>
          </div>

          <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition">
            Simpan Perubahan
          </button>
        </form>

      </div>
    </div>
  `;

  const emailInput = document.getElementById("profile-email");
  const wilayahSelect = document.getElementById("profile-wilayah");
  const alertEl = document.getElementById("profile-alert");

  // Load Wilayah & Profile
  Promise.all([ApiService.getWilayah(), ApiService.getProfile()])
    .then(([wilayahList, profileData]) => {
      emailInput.value = profileData.email;

      wilayahSelect.innerHTML = '<option value="">Pilih Wilayah</option>';
      wilayahList.forEach((w) => {
        const option = document.createElement("option");
        option.value = w.id;
        option.textContent = w.label;
        if (Number(w.id) === Number(profileData.wilayah_id)) {
          option.selected = true;
        }
        wilayahSelect.appendChild(option);
      });
    })
    .catch((err) => {
      alertEl.className =
        "p-3 rounded text-sm font-medium bg-red-900/50 text-red-300 border border-red-700";
      alertEl.textContent = "Gagal memuat profil: " + err.message;
      alertEl.classList.remove("hidden");
    });

  // Handle Form Submission
  document
    .getElementById("profile-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const newWilayahId = wilayahSelect.value;

      if (!newWilayahId) {
        alertEl.className =
          "p-3 rounded text-sm font-medium bg-red-900/50 text-red-300 border border-red-700";
        alertEl.textContent = "Silakan pilih wilayah terlebih dahulu.";
        alertEl.classList.remove("hidden");
        return;
      }

      try {
        await ApiService.updateProfile({ wilayah_id: Number(newWilayahId) });
        alertEl.className =
          "p-3 rounded text-sm font-medium bg-green-900/50 text-green-300 border border-green-700";
        alertEl.textContent = "Wilayah notifikasi berhasil diperbarui!";
        alertEl.classList.remove("hidden");
      } catch (err) {
        alertEl.className =
          "p-3 rounded text-sm font-medium bg-red-900/50 text-red-300 border border-red-700";
        alertEl.textContent = "Gagal memperbarui: " + err.message;
        alertEl.classList.remove("hidden");
      }
    });
}
