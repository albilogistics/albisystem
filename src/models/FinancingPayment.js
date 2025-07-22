const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancingPayment = sequelize.define('FinancingPayment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    financingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Financing',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentType: {
      type: DataTypes.ENUM('interest', 'principal', 'both'),
      allowNull: false,
      defaultValue: 'both'
    },
    interestAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    principalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'FinancingPayments',
    timestamps: true
  });

  FinancingPayment.associate = (models) => {
    FinancingPayment.belongsTo(models.Financing, {
      foreignKey: 'financingId',
      as: 'financing'
    });
  };

  return FinancingPayment;
}; 