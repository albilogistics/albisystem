const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Financing = sequelize.define('Financing', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2), // 1.50 for 1.5%
      allowNull: false,
      defaultValue: 1.50
    },
    interestPeriod: {
      type: DataTypes.INTEGER, // days
      allowNull: false,
      defaultValue: 7
    },
    financedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    nextInterestDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    totalInterestPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    totalAmountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    remainingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'paid', 'overdue', 'cancelled'),
      allowNull: false,
      defaultValue: 'active'
    },
    lastInterestCalculation: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Financing',
    timestamps: true
  });

  Financing.associate = (models) => {
    Financing.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });
    
    Financing.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Financing.hasMany(models.FinancingPayment, {
      foreignKey: 'financingId',
      as: 'payments'
    });
  };

  return Financing;
}; 