module.exports = (sequelize, DataTypes) => {
  const Alert = sequelize.define('Alert', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    alert_type: {
      type: DataTypes.ENUM('temperature', 'humidity', 'battery', 'location', 'speed', 'maintenance', 'emergency'),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    transport_id: { type: DataTypes.STRING(50) },
    uav_id: { type: DataTypes.STRING(50) },
    organ_id: { type: DataTypes.STRING(50) },
    message: { type: DataTypes.TEXT, allowNull: false },
    sensor_data: { type: DataTypes.JSON },
    is_resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
    resolved_by: { type: DataTypes.INTEGER },
    resolved_at: { type: DataTypes.DATE },
  }, {
    tableName: 'alerts',
    underscored: true,
    timestamps: true,
    updatedAt: false, // Only created_at exists in the database
  });

  Alert.associate = (models) => {
    Alert.belongsTo(models.Transport, { foreignKey: 'transport_id', targetKey: 'transport_id', as: 'transport' });
    Alert.belongsTo(models.Organ, { foreignKey: 'organ_id', targetKey: 'organ_id', as: 'organ' });
    Alert.belongsTo(models.UAV, { foreignKey: 'uav_id', targetKey: 'uav_id', as: 'uav' });
    Alert.belongsTo(models.User, { foreignKey: 'resolved_by', as: 'resolver' });
  };

  return Alert;
}; 