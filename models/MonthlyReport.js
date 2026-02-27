module.exports = (sequelize, DataTypes) => {
  const MonthlyReport = sequelize.define('MonthlyReport', {
    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'customers', key: 'customer_id' }
    },
    report_month: {
      type: DataTypes.DATEONLY, // format: YYYY-MM-DD (set to first of month)
      allowNull: false,
    },
    new_reviews_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    avg_rating_month: {
      type: DataTypes.DECIMAL(3, 2),
    },
    low_rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating_change: {
      type: DataTypes.DECIMAL(3, 2),
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'READY_FOR_SUMMARY', 'SUMMARY_ADDED', 'SENT'),
      defaultValue: 'DRAFT',
    },
    generated_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'monthly_reports',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['report_month'] },
      { fields: ['status'] },
    ],
  });

  MonthlyReport.associate = (models) => {
    MonthlyReport.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    MonthlyReport.hasOne(models.ReportSummary, { foreignKey: 'report_id' });
    MonthlyReport.hasMany(models.MessageLog, { foreignKey: 'report_id' });
  };

  // Unique constraint on (customer_id, report_month) should be added in migration
  return MonthlyReport;
};
