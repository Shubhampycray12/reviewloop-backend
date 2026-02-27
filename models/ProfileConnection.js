module.exports = (sequelize, DataTypes) => {
  const ProfileConnection = sequelize.define('ProfileConnection', {
    connection_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'customers', key: 'customer_id' }
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'GOOGLE',
    },
    status: {
      type: DataTypes.ENUM('CONNECTED', 'DISCONNECTED', 'EXPIRED', 'ERROR'),
      defaultValue: 'DISCONNECTED',
    },
    refresh_token_encrypted: {
      type: DataTypes.TEXT,
    },
    token_expiry: {
      type: DataTypes.DATE,
    },
    account_id: {
      type: DataTypes.STRING(255),
    },
    location_id: {
      type: DataTypes.STRING(255),
    },
  }, {
    tableName: 'profile_connections',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['status'] },
    ],
  });

  ProfileConnection.associate = (models) => {
    ProfileConnection.belongsTo(models.Customer, { foreignKey: 'customer_id' });
  };

  return ProfileConnection;
};
