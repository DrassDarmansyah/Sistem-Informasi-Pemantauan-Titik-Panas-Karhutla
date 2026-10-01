const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class PersonalAccessToken extends Model {}

PersonalAccessToken.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tokenable_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "User",
    },
    tokenable_id: { type: DataTypes.INTEGER, allowNull: false },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "api-token",
    },
    token: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    last_used_at: { type: DataTypes.DATE, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "PersonalAccessToken",
    tableName: "personal_access_tokens",
  },
);

module.exports = PersonalAccessToken;
