const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

const ROLE_WARGA = "warga";
const ROLE_OPERATOR = "operator";

class User extends Model {
  isWarga() {
    return this.role === ROLE_WARGA;
  }

  isOperator() {
    return this.role === ROLE_OPERATOR;
  }

  toPublicJSON() {
    const { id, name, email, phone, role, wilayah_id, created_at, updated_at } =
      this.get({
        plain: true,
      });
    return { id, name, email, phone, role, wilayah_id, created_at, updated_at };
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM(ROLE_WARGA, ROLE_OPERATOR),
      allowNull: false,
      defaultValue: ROLE_WARGA,
    },
    wilayah_id: { type: DataTypes.INTEGER, allowNull: true },
    email_verified_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  },
);

User.ROLE_WARGA = ROLE_WARGA;
User.ROLE_OPERATOR = ROLE_OPERATOR;

module.exports = User;
