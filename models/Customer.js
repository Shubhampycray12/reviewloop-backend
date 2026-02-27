module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    business_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    owner_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    whatsapp_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        // E.164-style: optional + then 10–15 digits
        is: /^\+?[0-9]{10,15}$/
      },
    },
    email: {
      type: DataTypes.STRING(255),
      validate: { isEmail: true },
    },
    gst_number: DataTypes.STRING(50),
    pincode: DataTypes.STRING(10),
    address: DataTypes.TEXT,
    preferred_language: {
      type: DataTypes.ENUM('EN', 'HI', 'MR'),
      defaultValue: 'EN',
    },
    logo_url: DataTypes.STRING(500),
    google_business_link: DataTypes.STRING(500),
    status: {
      type: DataTypes.ENUM('LEAD', 'PAID', 'ACTIVE', 'INACTIVE', 'CHURNED'),
      defaultValue: 'LEAD',
    },
  }, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['whatsapp_phone'] },
      { fields: ['status'] },
    ],
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.Order, { foreignKey: 'customer_id' });
    Customer.hasOne(models.Subscription, { foreignKey: 'customer_id' });
    Customer.hasOne(models.ProfileConnection, { foreignKey: 'customer_id' });
    Customer.hasMany(models.Review, { foreignKey: 'customer_id' });
    Customer.hasMany(models.MonthlyReport, { foreignKey: 'customer_id' });
    Customer.hasMany(models.MessageLog, { foreignKey: 'customer_id' });
  };

  return Customer;
};
