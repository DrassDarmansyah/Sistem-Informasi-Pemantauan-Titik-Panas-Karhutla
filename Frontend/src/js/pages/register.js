import { ApiService } from "../api.js";
import { Router } from "../router.js";

export function renderRegisterPage(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto w-full py-12 px-4">
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl space-y-6">
        <h2 class="text-2xl font-black text-center text-white">Daftar Akun Warga</h2>

        <div id="reg-error" class="hidden p-3 rounded bg-red-900/50 border border-red-700 text-red-300 text-sm"></div>

        <form id="reg-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
            <input type="text" id="reg-name" required class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="text" id="reg-email" required class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" id="reg-password" required class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Konfirmasi Password</label>
            <input type="password" id="reg-password-confirm" required class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Wilayah Notifikasi</label>
            <select id="reg-wilayah" required class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
              <option value="">Memuat Wilayah...</option>
            </select>
          </div>

          <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded transition">
            Daftar Sekarang
          </button>
        </form>

        <p class="text-center text-sm text-gray-400">
          Sudah punya akun? <a href="#/login" class="text-red-400 hover:underline">Masuk</a>
        </p>
      </div>
    </div>
  `;

  const wilayahSelect = document.getElementById("reg-wilayah");
  ApiService.getWilayah()
    .then((list) => {
      wilayahSelect.innerHTML = '<option value="">Pilih Wilayah</option>';
      list.forEach((w) => {
        wilayahSelect.innerHTML += `<option value="${w.id}">${w.label}</option>`;
      });
    })
    .catch((err) => console.error("Gagal memuat wilayah", err));

  document.getElementById("reg-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const passwordConfirm = document.getElementById(
      "reg-password-confirm",
    ).value;
    const wilayah_id = wilayahSelect.value;
    const errorEl = document.getElementById("reg-error");

    if (password !== passwordConfirm) {
      errorEl.textContent = "Konfirmasi password tidak sama dengan password.";
      errorEl.classList.remove("hidden");
      return;
    }
    errorEl.classList.add("hidden");

    try {
      await ApiService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
        wilayah_id: Number(wilayah_id),
      });
      alert("Registrasi Berhasil! Silakan masuk.");
      Router.navigate("/login");
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove("hidden");
    }
  });
}
