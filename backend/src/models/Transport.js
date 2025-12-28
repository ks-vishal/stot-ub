module.exports = (sequelize, DataTypes) => {
  const Transport = sequelize.define('Transport', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    transport_id: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    organ_id: { type: DataTypes.STRING(50), allowNull: false },
    uav_id: { type: DataTypes.STRING(50), allowNull: false },
    operator_id: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    estimated_duration: { type: DataTypes.INTEGER },
    actual_duration: { type: DataTypes.INTEGER },
    start_location_lat: { type: DataTypes.DECIMAL(10,8), allowNull: false },
    start_location_lng: { type: DataTypes.DECIMAL(11,8), allowNull: false },
    end_location_lat: { type: DataTypes.DECIMAL(10,8) },
    end_location_lng: { type: DataTypes.DECIMAL(11,8) },
    status: {
      type: DataTypes.ENUM('pending', 'in_transit', 'arrived', 'completed', 'delivered', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },
    distance_covered: { type: DataTypes.DECIMAL(8,2) },
    average_speed: { type: DataTypes.DECIMAL(5,2) },
    blockchain_tx_hash: { type: DataTypes.STRING(66) },
  }, {
    tableName: 'transports',
    underscored: true,
    timestamps: true,
  });

  Transport.associate = (models) => {
    Transport.belongsTo(models.User, { foreignKey: 'operator_id', as: 'operator' });
    Transport.belongsTo(models.Organ, { foreignKey: 'organ_id', targetKey: 'organ_id', as: 'organ' });
    Transport.belongsTo(models.UAV, { foreignKey: 'uav_id', targetKey: 'uav_id', as: 'uav' });
    Transport.hasMany(models.SensorReading, { foreignKey: 'transport_id', sourceKey: 'transport_id', as: 'sensor_readings' });
    Transport.hasMany(models.BlockchainTransaction, { foreignKey: 'transport_id', sourceKey: 'transport_id', as: 'blockchain_transactions' });
    Transport.hasMany(models.AuditLog, { foreignKey: 'transport_id', sourceKey: 'transport_id', as: 'audit_logs' });
  };

  return Transport;
}; 