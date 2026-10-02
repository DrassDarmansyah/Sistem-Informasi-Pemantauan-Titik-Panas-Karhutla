import { Store } from "../store.js";
import { ApiService } from "../api.js";
import { Router } from "../router.js";

export function renderNavbar() {
  const container = document.getElementById("navbar-container");
  const user = Store.getUser();

  container.innerHTML = `
    <nav class="bg-gray-950 border-b border-gray-800 px-6 py-4 flex justify-between items-center shadow-lg">
      <div class="flex items-center space-x-6">
        <a href="#/" class="text-2xl font-black text-red-500 tracking-wider flex items-center gap-2">
          🔥 VINIX7
        </a>
        <div class="hidden md:flex space-x-4">
          <a href="#/map" class="text-gray-300 hover:text-red-400 font-medium transition">Peta Sebaran</a>
          ${
            user && user.role === "operator"
              ? `
            <a href="#/dashboard" class="text-gray-300 hover:text-red-400 font-medium transition">Dashboard Operator</a>
          `
              : ""
          }
        </div>
      </div>

      <div class="flex items-center space-x-4">
        ${
          user
            ? `
          <div class="flex items-center space-x-3">
            <a href="#/profile" class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md border border-gray-700">
              👤 ${user.email} (${user.role})
            </a>
            <button id="btn-logout" class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md font-medium transition">
              Logout
            </button>
          </div>
        `
            : `
          <a href="#/login" class="text-gray-300 hover:text-white px-3 py-1.5 text-sm font-medium">Masuk</a>
          <a href="#/register" class="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-md font-medium transition">Daftar Akun</a>
        `
        }
      </div>
    </nav>
  `;

  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await ApiService.logout();
      } catch (e) {
        console.warn("Logout API failed, clearing local session anyway.");
      } finally {
        ApiService.clearToken();
        Store.clear();
        Router.navigate("/login");
      }
    });
  }
}
