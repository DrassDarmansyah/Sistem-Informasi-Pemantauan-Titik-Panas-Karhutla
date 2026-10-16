const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

const useSsl = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_DATABASE || "karhutla_monitoring_node",
  process.env.DB_USERNAME || "root",
  process.env.DB_PASSWORD || process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,

    // SSL hanya aktif kalau DB_SSL=true (database cloud).
    // Untuk MySQL lokal, biarkan DB_SSL kosong.
    dialectOptions: useSsl
      ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
      : {},

    // Serverless: batasi koneksi dan lepas cepat.
    pool: { max: 2, min: 0, idle: 10000, acquire: 30000 },

    define: {
      underscored: true,
      timestamps: true,
    },
  },
);

module.exports = sequelize;
