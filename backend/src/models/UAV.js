module.exports = (sequelize, DataTypes) => {
  const UAV = sequelize.define('UAV', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uav_id: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    model: { type: DataTypes.STRING(100), allowNull: false },
    manufacturer: { type: DataTypes.STRING(100) },
    max_payload: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    max_range: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    max_flight_time: { type: DataTypes.INTEGER, allowNull: false },
    battery_capacity: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    current_battery: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'offline'),
      defaultValue: 'available',
    },
    current_location_lat: { type: DataTypes.DECIMAL(10,8) },
    current_location_lng: { type: DataTypes.DECIMAL(11,8) },
    altitude: { type: DataTypes.DECIMAL(8,2) },
    speed: { type: DataTypes.DECIMAL(5,2) },
    operator_id: { type: DataTypes.INTEGER },
    last_maintenance_date: { type: DataTypes.DATE },
    next_maintenance_date: { type: DataTypes.DATE },
    total_flight_hours: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    tableName: 'uavs',
    underscored: true,
    timestamps: true,
  });

  UAV.associate = (models) => {
    UAV.hasMany(models.Transport, { foreignKey: 'uav_id', sourceKey: 'uav_id', as: 'transports' });
    UAV.hasMany(models.Organ, { foreignKey: 'assigned_uav_id', sourceKey: 'uav_id', as: 'assigned_organs' });
  };

  return UAV;
}; 