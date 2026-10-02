import { defineConfig } from "vite";

// Port 3000 disamakan dengan FRONTEND_URL di Backend/.env supaya lolos CORS
export default defineConfig({
  server: { port: 3000, strictPort: true },
});
