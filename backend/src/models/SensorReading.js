module.exports = (sequelize, DataTypes) => {
  const SensorReading = sequelize.define('SensorReading', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    transport_id: { type: DataTypes.STRING(50), allowNull: false },
    organ_id: { type: DataTypes.STRING(50), allowNull: false },
    uav_id: { type: DataTypes.STRING(50), allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    temperature: { type: DataTypes.DECIMAL(4,2), allowNull: false },
    humidity: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    pressure: { type: DataTypes.DECIMAL(6,2) },
    altitude: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    latitude: { type: DataTypes.DECIMAL(10,8), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(11,8), allowNull: false },
    speed: { type: DataTypes.DECIMAL(5,2) },
    battery_level: { type: DataTypes.DECIMAL(5,2) },
    signal_strength: { type: DataTypes.INTEGER },
    vibration_level: { type: DataTypes.DECIMAL(4,2) },
    light_intensity: { type: DataTypes.INTEGER },
  }, {
    tableName: 'sensor_data',
    underscored: true,
    timestamps: true,
  });

  SensorReading.associate = (models) => {
    SensorReading.belongsTo(models.Transport, { foreignKey: 'transport_id', targetKey: 'transport_id', as: 'transport' });
    SensorReading.belongsTo(models.Organ, { foreignKey: 'organ_id', targetKey: 'organ_id', as: 'organ' });
  };

  return SensorReading;
}; 