const sequelize = require("../config/database");
const User = require("./User");
const Wilayah = require("./Wilayah");
const Hotspot = require("./Hotspot");
const NotificationLog = require("./NotificationLog");
const PersonalAccessToken = require("./PersonalAccessToken");

Wilayah.hasMany(User, { foreignKey: "wilayah_id", as: "users" });
User.belongsTo(Wilayah, { foreignKey: "wilayah_id", as: "wilayah" });

Wilayah.hasMany(Hotspot, { foreignKey: "wilayah_id", as: "hotspots" });
Hotspot.belongsTo(Wilayah, { foreignKey: "wilayah_id", as: "wilayah" });

User.hasMany(NotificationLog, {
  foreignKey: "user_id",
  as: "notificationLogs",
});
NotificationLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

Hotspot.hasMany(NotificationLog, {
  foreignKey: "hotspot_id",
  as: "notificationLogs",
});
NotificationLog.belongsTo(Hotspot, { foreignKey: "hotspot_id", as: "hotspot" });

module.exports = {
  sequelize,
  User,
  Wilayah,
  Hotspot,
  NotificationLog,
  PersonalAccessToken,
};
