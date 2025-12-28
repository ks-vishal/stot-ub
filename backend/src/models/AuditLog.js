module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING(100), allowNull: false },
    table_name: { type: DataTypes.STRING(50) },
    record_id: { type: DataTypes.STRING(50) },
    old_values: { type: DataTypes.JSON },
    new_values: { type: DataTypes.JSON },
    ip_address: { type: DataTypes.STRING(45) },
    user_agent: { type: DataTypes.TEXT },
  }, {
    tableName: 'audit_logs',
    underscored: true,
    timestamps: false,
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    AuditLog.belongsTo(models.Transport, { foreignKey: 'transport_id', targetKey: 'transport_id', as: 'transport' });
  };

  return AuditLog;
}; 