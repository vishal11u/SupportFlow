module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define(
    "Tenant",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "tenants",
      timestamps: true,
      paranoid: true,
    }
  );

  return Tenant;
};
