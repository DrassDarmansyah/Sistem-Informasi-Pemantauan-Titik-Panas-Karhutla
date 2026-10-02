import { ApiService } from "./api.js";
import { Store } from "./store.js";
import { Router } from "./router.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = ApiService.getToken();

  if (token) {
    try {
      const user = await ApiService.getMe();
      Store.setUser(user);
    } catch (err) {
      console.warn("Session expired or invalid token");
      ApiService.clearToken();
    }
  }

  Router.init();
});
