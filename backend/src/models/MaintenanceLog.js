module.exports = (sequelize, DataTypes) => {
  const MaintenanceLog = sequelize.define('MaintenanceLog', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uav_id: { type: DataTypes.STRING(50), allowNull: false },
    maintenance_type: {
      type: DataTypes.ENUM('routine', 'repair', 'inspection', 'upgrade'),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    performed_by: { type: DataTypes.INTEGER, allowNull: false },
    performed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    next_maintenance_date: { type: DataTypes.DATE },
    cost: { type: DataTypes.DECIMAL(10,2) },
    parts_replaced: { type: DataTypes.JSON },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 'maintenance_logs',
    underscored: true,
    timestamps: true,
  });

  MaintenanceLog.associate = (models) => {
    MaintenanceLog.belongsTo(models.UAV, { foreignKey: 'uav_id', targetKey: 'uav_id', as: 'uav' });
    MaintenanceLog.belongsTo(models.User, { foreignKey: 'performed_by', as: 'user' });
  };

  return MaintenanceLog;
}; 