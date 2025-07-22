const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MarketSettings = sequelize.define('MarketSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    market: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('settings');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('settings', JSON.stringify(value));
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'MarketSettings',
    timestamps: true
  });

  return MarketSettings;
}; 