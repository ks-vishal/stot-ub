module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'operator', 'doctor', 'coordinator', 'hospital', 'authority'),
      allowNull: false,
      defaultValue: 'operator',
    },
    first_name: { type: DataTypes.STRING(50), allowNull: false },
    last_name: { type: DataTypes.STRING(50), allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    address: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
  });

  User.associate = (models) => {
    User.hasMany(models.Transport, { foreignKey: 'operator_id', as: 'transports' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
    User.hasMany(models.MaintenanceLog, { foreignKey: 'performed_by', as: 'maintenance_logs' });
    User.hasMany(models.Organ, { foreignKey: 'assigned_operator_id', as: 'assigned_organs' });
  };

  return User;
};