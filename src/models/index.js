const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    freezeTableName: true,
    underscored: true
  }
});

// Import models
const User = require('./User')(sequelize);
const Product = require('./Product')(sequelize);
const Cart = require('./Cart')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Payment = require('./Payment')(sequelize);
const OrderStatusHistory = require('./OrderStatusHistory')(sequelize);
const PriceHistory = require('./PriceHistory')(sequelize);
const MarketSettings = require('./MarketSettings')(sequelize);
const Financing = require('./Financing')(sequelize);
const FinancingPayment = require('./FinancingPayment')(sequelize);
const FinancingSettings = require('./FinancingSettings')(sequelize);

// Set up associations
User.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
Product.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
Cart.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
Order.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
OrderItem.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
Payment.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
OrderStatusHistory.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
PriceHistory.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
Financing.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
FinancingPayment.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });
FinancingSettings.associate({ User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory, PriceHistory, MarketSettings, Financing, FinancingPayment, FinancingSettings });

// Test connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Check if emailVerified column exists, if not add it
    try {
      await sequelize.query('SELECT emailVerified FROM Users LIMIT 1');
    } catch (error) {
      if (error.message.includes('no such column: emailVerified')) {
        console.log('Adding emailVerified column to Users table...');
        await sequelize.query('ALTER TABLE Users ADD COLUMN emailVerified BOOLEAN DEFAULT 0');
        console.log('emailVerified column added successfully.');
      }
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  User,
  Product,
  Cart,
  Order,
  OrderItem,
  Payment,
  OrderStatusHistory,
  PriceHistory,
  MarketSettings,
  Financing,
  FinancingPayment,
  FinancingSettings
}; 