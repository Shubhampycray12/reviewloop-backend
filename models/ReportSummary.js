module.exports = (sequelize, DataTypes) => {
  const ReportSummary = sequelize.define('ReportSummary', {
    summary_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'monthly_reports', key: 'report_id' }
    },
    summary_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    next_action_text: {
      type: DataTypes.TEXT,
    },
    created_by: {
      type: DataTypes.STRING(255), // admin user identifier
    },
  }, {
    tableName: 'report_summaries',
    timestamps: true,
    underscored: true,
  });

  ReportSummary.associate = (models) => {
    ReportSummary.belongsTo(models.MonthlyReport, { foreignKey: 'report_id' });
  };

  return ReportSummary;
};
