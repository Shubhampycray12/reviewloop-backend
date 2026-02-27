module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    admin_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: 'admins',
    timestamps: true,
    underscored: true,
  });

  Admin.associate = () => {};

  return Admin;
};
