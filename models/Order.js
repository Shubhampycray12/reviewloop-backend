module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'customers', key: 'customer_id' }
    },
    order_type: {
      type: DataTypes.ENUM('PHYSICAL_KIT', 'STARTER_SETUP', 'SUBSCRIPTION_ACTIVATION'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR',
    },
    payment_status: {
      type: DataTypes.ENUM('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED'),
      defaultValue: 'INITIATED',
    },
    gateway_provider: {
      type: DataTypes.STRING(50),
    },
    gateway_order_id: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    gateway_payment_id: {
      type: DataTypes.STRING(100),
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['payment_status'] },
      { fields: ['gateway_provider', 'gateway_payment_id'], unique: true },
    ],
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id' });
  };

  return Order;
};
