module.exports = (sequelize, DataTypes) => {
  const Organ = sequelize.define('Organ', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    organ_id: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    organ_type: {
      type: DataTypes.ENUM('heart', 'liver', 'kidney', 'lung', 'pancreas', 'intestine'),
      allowNull: false,
    },
    blood_type: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false,
    },
    donor_id: { type: DataTypes.STRING(100), allowNull: false },
    recipient_id: { type: DataTypes.STRING(100), allowNull: false },
    donor_hospital: { type: DataTypes.STRING(200), allowNull: false },
    recipient_hospital: { type: DataTypes.STRING(200), allowNull: false },
    donor_location_lat: { type: DataTypes.DECIMAL(10,8), allowNull: false },
    donor_location_lng: { type: DataTypes.DECIMAL(11,8), allowNull: false },
    recipient_location_lat: { type: DataTypes.DECIMAL(10,8), allowNull: false },
    recipient_location_lng: { type: DataTypes.DECIMAL(11,8), allowNull: false },
    priority_level: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'container_assigned', 'sealed', 'in_transit', 'delivered', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },
    preservation_time_limit: { type: DataTypes.INTEGER, allowNull: false },
    current_temperature: { type: DataTypes.DECIMAL(4,2) },
    current_humidity: { type: DataTypes.DECIMAL(5,2) },
    current_location_lat: { type: DataTypes.DECIMAL(10,8) },
    current_location_lng: { type: DataTypes.DECIMAL(11,8) },
    assigned_uav_id: { type: DataTypes.STRING(50) },
    assigned_operator_id: { type: DataTypes.INTEGER },
  }, {
    tableName: 'organs',
    underscored: true,
    timestamps: true,
  });

  Organ.associate = (models) => {
    Organ.belongsTo(models.User, { foreignKey: 'assigned_operator_id', as: 'operator' });
    Organ.hasMany(models.Transport, { foreignKey: 'organ_id', sourceKey: 'organ_id', as: 'transports' });
    Organ.hasMany(models.SensorReading, { foreignKey: 'organ_id', sourceKey: 'organ_id', as: 'sensor_readings' });
    Organ.hasMany(models.BlockchainTransaction, { foreignKey: 'organ_id', sourceKey: 'organ_id', as: 'blockchain_transactions' });
  };

  return Organ;
}; 