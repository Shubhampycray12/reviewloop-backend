module.exports = (sequelize, DataTypes) => {
  const JobRunLog = sequelize.define('JobRunLog', {
    job_run_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    job_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: { model: 'customers', key: 'customer_id' }
    },
    run_month: {
      type: DataTypes.STRING(7), // YYYY-MM
    },
    status: {
      type: DataTypes.ENUM('STARTED', 'SUCCESS', 'FAILED', 'PARTIAL'),
      allowNull: false,
    },
    error_message: {
      type: DataTypes.TEXT,
    },
    started_at: {
      type: DataTypes.DATE,
    },
    finished_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'jobs_run_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['job_name'] },
      { fields: ['status'] },
      { fields: ['started_at'] },
    ],
  });

  JobRunLog.associate = (models) => {
    JobRunLog.belongsTo(models.Customer, { foreignKey: 'customer_id' });
  };

  return JobRunLog;
};
