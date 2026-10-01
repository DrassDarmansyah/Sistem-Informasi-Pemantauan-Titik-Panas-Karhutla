const swaggerJsdoc = require("swagger-jsdoc");

/**
 * Konfigurasi OpenAPI (dibaca dari komentar @swagger di file routes/api.js).
 * Dokumentasi interaktifnya bisa dibuka di GET /api/docs (lihat app.js).
 */
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Karhutla API",
      version: "1.0.0",
      description:
        "Dokumentasi API backend Sistem Pemantauan Karhutla (Node.js/Express) ",
    },
    servers: [
      {
        url: (process.env.APP_URL || "http://localhost:8000") + "/api",
        description: "Server aktif",
      },
    ],
    tags: [
      { name: "Auth", description: "Registrasi, login, logout" },
      { name: "Wilayah", description: "Data wilayah administratif" },
      { name: "Hotspots", description: "Data titik panas (publik)" },
      { name: "Profile", description: "Profil akun Warga (butuh token)" },
      {
        name: "Summary",
        description: "Rekap agregasi untuk Operator (butuh token)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description:
            'Token didapat dari response login, format "{id}|{plainTextToken}". ' +
            "Contoh header: Authorization: Bearer 1|abcdef1234...",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Data yang dikirim tidak valid.",
            },
            errors: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
              example: { email: ["Email ini sudah terdaftar."] },
            },
          },
        },
      },
    },
  },
  // File-file yang dipindai untuk mencari komentar @swagger
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
