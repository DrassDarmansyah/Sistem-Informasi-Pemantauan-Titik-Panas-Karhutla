const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE || "karhutla_monitoring_node",
  process.env.DB_USERNAME || "root",
  process.env.DB_PASSWORD || process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  },
);

module.exports = sequelize;
