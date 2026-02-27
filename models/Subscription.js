module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    subscription_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true, // one active subscription per customer (in MVP)
      references: { model: 'customers', key: 'customer_id' }
    },
    plan_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'STARTER_MONTHLY',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'CANCELLED'),
      defaultValue: 'ACTIVE',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    next_billing_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['status'] },
      { fields: ['next_billing_date'] },
    ],
  });

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.Customer, { foreignKey: 'customer_id' });
  };

  return Subscription;
};
