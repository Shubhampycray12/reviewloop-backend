module.exports = (sequelize, DataTypes) => {
  const MessageLog = sequelize.define('MessageLog', {
    message_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'customers', key: 'customer_id' }
    },
    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: { model: 'monthly_reports', key: 'report_id' }
    },
    channel: {
      type: DataTypes.STRING(20),
      defaultValue: 'WHATSAPP',
    },
    to_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    message_text: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('QUEUED', 'SENT', 'FAILED'),
      defaultValue: 'QUEUED',
    },
    sent_at: {
      type: DataTypes.DATE,
    },
    sent_by: {
      type: DataTypes.STRING(255), // 'system' or admin email
    },
  }, {
    tableName: 'message_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['report_id'] },
      { fields: ['status'] },
    ],
  });

  MessageLog.associate = (models) => {
    MessageLog.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    MessageLog.belongsTo(models.MonthlyReport, { foreignKey: 'report_id' });
  };

  return MessageLog;
};
