const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancingSettings = sequelize.define('FinancingSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    defaultInterestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.50
    },
    defaultInterestPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7
    },
    autoCalculateInterest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sendReminders: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    reminderDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    maxFinancingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    requireApproval: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    approvalThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    lateFeeRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.00
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    gracePeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'FinancingSettings',
    timestamps: true
  });

  FinancingSettings.associate = (models) => {
    // No associations needed for settings
  };

  return FinancingSettings;
}; 