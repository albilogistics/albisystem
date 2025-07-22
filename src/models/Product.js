const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Unknown'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'base_price'
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 25,
      field: 'shipping_cost'
    },
    repairCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'repair_cost'
    },
    partsCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'parts_cost'
    },
    additionalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'additional_cost'
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_cost'
    },
    sellPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'sell_price'
    },
    margin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 20
    },
    profitUSD: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'profit_u_s_d'
    },
    commission: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5
    },
    market: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'VE'
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'OutOfStock'),
      allowNull: false,
      defaultValue: 'Active'
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_updated'
    },
    isOverride: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_override'
    },
    overridePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'override_price'
    },
    inventoryLastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'inventory_last_updated'
    },
    priceLastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'price_last_updated'
    },
    marketSettingsSnapshot: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'market_settings_snapshot'
    }
  }, {
    tableName: 'Products',
    timestamps: true,
    indexes: [
      {
        fields: ['model', 'grade', 'capacity', 'market']
      }
    ]
  });

  Product.associate = (models) => {
    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId',
      as: 'orderItems'
    });
  };

  // Instance method to get final price (considering overrides)
  Product.prototype.getFinalPrice = function() {
    if (this.isOverride && this.overridePrice) {
      return this.overridePrice;
    }
    return this.sellPrice;
  };

  // Instance method to check if product is available
  Product.prototype.isAvailable = function() {
    return this.status === 'Active' && this.quantity > 0;
  };

  return Product;
}; 