const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

const CONF_LOW = "low";
const CONF_MEDIUM = "medium";
const CONF_HIGH = "high";

class Hotspot extends Model {}

const floatGetter = (field) =>
  function () {
    const v = this.getDataValue(field);
    return v === null || v === undefined ? null : parseFloat(v);
  };

Hotspot.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      get: floatGetter("latitude"),
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      get: floatGetter("longitude"),
    },
    brightness: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      get: floatGetter("brightness"),
    },
    frp: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      get: floatGetter("frp"),
    },
    satellite: { type: DataTypes.STRING, allowNull: true },
    confidence_raw: { type: DataTypes.STRING, allowNull: true },
    confidence_level: {
      type: DataTypes.ENUM(CONF_LOW, CONF_MEDIUM, CONF_HIGH),
      allowNull: false,
    },
    acq_date: { type: DataTypes.DATEONLY, allowNull: false },
    acq_time: { type: DataTypes.STRING, allowNull: false },
    detected_at: { type: DataTypes.DATE, allowNull: false },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "NASA_FIRMS",
    },
    wilayah_id: { type: DataTypes.INTEGER, allowNull: true },
    dedup_key: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  },
  {
    sequelize,
    modelName: "Hotspot",
    tableName: "hotspots",
    indexes: [
      { fields: ["acq_date"] },
      { fields: ["confidence_level"] },
      { fields: ["latitude", "longitude"] },
    ],
  },
);

Hotspot.CONF_LOW = CONF_LOW;
Hotspot.CONF_MEDIUM = CONF_MEDIUM;
Hotspot.CONF_HIGH = CONF_HIGH;

module.exports = Hotspot;
