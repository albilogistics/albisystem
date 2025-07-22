const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'paid', 'shipped', 'delivered', 'cancelled'),
      allowNull: false
    },
    changedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'OrderStatusHistory',
    timestamps: true,
    updatedAt: false // Only track creation time
  });

  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });
    
    OrderStatusHistory.belongsTo(models.User, {
      foreignKey: 'changedBy',
      as: 'changedByUser'
    });
  };

  return OrderStatusHistory;
}; 