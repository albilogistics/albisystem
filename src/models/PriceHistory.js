const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PriceHistory = sequelize.define('PriceHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    oldPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'old_price'
    },
    newPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'new_price'
    },
    changeType: {
      type: DataTypes.ENUM('manual', 'automatic', 'import'),
      allowNull: false,
      defaultValue: 'automatic',
      field: 'change_type'
    },
    changeReason: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'change_reason'
    },
    marketSettings: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'market_settings',
      comment: 'Snapshot of market settings at time of change'
    }
  }, {
    tableName: 'PriceHistory',
    timestamps: true,
    indexes: [
      {
        name: 'price_history_product_id',
        fields: ['product_id']
      },
      {
        name: 'price_history_created_at',
        fields: ['created_at']
      },
      {
        name: 'price_history_change_type',
        fields: ['change_type']
      }
    ]
  });

  PriceHistory.associate = (models) => {
    PriceHistory.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return PriceHistory;
}; 