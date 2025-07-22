const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'paid', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    billingAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estimateUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoiceUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentDueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remindersEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isFinanced: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    financingDetails: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'Orders',
    timestamps: true
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });
    
    Order.hasMany(models.Payment, {
      foreignKey: 'orderId',
      as: 'payments'
    });
    
    Order.hasMany(models.OrderStatusHistory, {
      foreignKey: 'orderId',
      as: 'statusHistory'
    });
    
    Order.hasOne(models.Financing, {
      foreignKey: 'orderId',
      as: 'financing'
    });
  };

  // Instance method to generate order number
  Order.prototype.generateOrderNumber = function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}${month}${day}-${random}`;
  };

  return Order;
}; 