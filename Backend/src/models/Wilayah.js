const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Wilayah extends Model {
  // Setara accessor getLabelAttribute() di Laravel:
  // "Kec. Pelalawan, Pelalawan, Riau"
  get label() {
    return `${this.nama}, ${this.kabupaten}, ${this.provinsi}`;
  }
}

Wilayah.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nama: { type: DataTypes.STRING, allowNull: false },
    kabupaten: { type: DataTypes.STRING, allowNull: false },
    provinsi: { type: DataTypes.STRING, allowNull: false },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      get() {
        const v = this.getDataValue("latitude");
        return v === null ? null : parseFloat(v);
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      get() {
        const v = this.getDataValue("longitude");
        return v === null ? null : parseFloat(v);
      },
    },
    radius_km: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 25,
      get() {
        const v = this.getDataValue("radius_km");
        return v === null ? null : parseFloat(v);
      },
    },
  },
  {
    sequelize,
    modelName: "Wilayah",
    tableName: "wilayah",
  },
);

module.exports = Wilayah;
