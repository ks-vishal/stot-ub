module.exports = (sequelize, DataTypes) => {
  const BlockchainTransaction = sequelize.define('BlockchainTransaction', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    event_type: {
      type: DataTypes.ENUM(
        'organ_registered', 
        'transport_started', 
        'transport_updated', 
        'transport_completed', 
        'transport_arrived',
        'container_assigned',
        'container_sealed',
        'container_unsealed',
        'alert_resolved',
        'emergency_stop'
      ),
      allowNull: false,
    },
    transport_id: { type: DataTypes.STRING(50) },
    organ_id: { type: DataTypes.STRING(50) },
    uav_id: { type: DataTypes.STRING(50) },
    operator_address: { type: DataTypes.STRING(42), allowNull: false },
    transaction_hash: { type: DataTypes.STRING(66), allowNull: false },
    block_number: { type: DataTypes.BIGINT },
    gas_used: { type: DataTypes.BIGINT },
    gas_price: { type: DataTypes.BIGINT },
    event_data: { type: DataTypes.JSON },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
      defaultValue: 'pending',
    },
    confirmed_at: { type: DataTypes.DATE },
  }, {
    tableName: 'blockchain_events',
    underscored: true,
    timestamps: false,
  });

  BlockchainTransaction.associate = (models) => {
    BlockchainTransaction.belongsTo(models.Transport, { foreignKey: 'transport_id', targetKey: 'transport_id', as: 'transport' });
    BlockchainTransaction.belongsTo(models.Organ, { foreignKey: 'organ_id', targetKey: 'organ_id', as: 'organ' });
    BlockchainTransaction.belongsTo(models.UAV, { foreignKey: 'uav_id', targetKey: 'uav_id', as: 'uav' });
  };

  return BlockchainTransaction;
}; 