import { ApiService } from "../api.js";
import { Store } from "../store.js";
import { Router } from "../router.js";

export function renderLoginPage(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto w-full py-16 px-4">
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl space-y-6">
        <h2 class="text-2xl font-black text-center text-white">Masuk ke VINIX7</h2>

        <div id="login-error" class="hidden p-3 rounded bg-red-900/50 border border-red-700 text-red-300 text-sm"></div>

        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="text" id="login-email" required class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" id="login-password" required class="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500">
          </div>

          <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded transition">
            Login
          </button>
        </form>

        <p class="text-center text-sm text-gray-400">
          Belum punya akun? <a href="#/register" class="text-red-400 hover:underline">Daftar Warga</a>
        </p>
      </div>
    </div>
  `;

  document
    .getElementById("login-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const errorEl = document.getElementById("login-error");

      try {
        const res = await ApiService.login({ email, password });
        ApiService.setToken(res.token);
        Store.setUser(res.user);

        if (res.user.role === "operator") {
          Router.navigate("/dashboard");
        } else {
          Router.navigate("/map");
        }
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
      }
    });
}
