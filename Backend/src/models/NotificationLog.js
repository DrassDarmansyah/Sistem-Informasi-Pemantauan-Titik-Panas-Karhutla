const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

const STATUS_SENT = "sent";
const STATUS_FAILED = "failed";
const CHANNEL_EMAIL = "email";
const CHANNEL_WHATSAPP = "whatsapp";

class NotificationLog extends Model {}

NotificationLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    hotspot_id: { type: DataTypes.INTEGER, allowNull: false },
    channel: { type: DataTypes.ENUM(CHANNEL_EMAIL), allowNull: false },
    status: {
      type: DataTypes.ENUM(STATUS_SENT, STATUS_FAILED),
      allowNull: false,
    },
    message: { type: DataTypes.TEXT, allowNull: true },
    error_message: { type: DataTypes.TEXT, allowNull: true },
    sent_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "NotificationLog",
    tableName: "notification_logs",
    indexes: [{ unique: true, fields: ["user_id", "hotspot_id", "channel"] }],
  },
);

NotificationLog.STATUS_SENT = STATUS_SENT;
NotificationLog.STATUS_FAILED = STATUS_FAILED;
NotificationLog.CHANNEL_EMAIL = CHANNEL_EMAIL;
NotificationLog.CHANNEL_WHATSAPP = CHANNEL_WHATSAPP;

module.exports = NotificationLog;
