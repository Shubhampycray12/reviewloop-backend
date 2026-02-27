module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    review_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'customers', key: 'customer_id' }
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'GOOGLE',
    },
    provider_review_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    review_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    raw_json: {
      type: DataTypes.JSON,
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['review_time'] },
    ],
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Customer, { foreignKey: 'customer_id' });
  };

  // Unique constraint on (provider, provider_review_id) should be added in migration
  return Review;
};
