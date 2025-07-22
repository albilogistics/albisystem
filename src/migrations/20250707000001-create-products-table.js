'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Products table
    await queryInterface.createTable('Products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      grade: {
        type: Sequelize.STRING,
        allowNull: false
      },
      capacity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shipping_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 25
      },
      repair_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      parts_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      additional_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      sell_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      margin: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 20
      },
      profit_u_s_d: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      commission: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 5
      },
      market: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'VE'
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive', 'OutOfStock'),
        allowNull: false,
        defaultValue: 'Active'
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      is_override: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      override_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes for better performance
    await queryInterface.addIndex('Products', ['model']);
    await queryInterface.addIndex('Products', ['grade']);
    await queryInterface.addIndex('Products', ['status']);
    await queryInterface.addIndex('Products', ['market']);
    await queryInterface.addIndex('Products', ['quantity']);
    // Add unique index for model, grade, capacity, color, and market
    await queryInterface.addIndex('Products', ['model', 'grade', 'capacity', 'color', 'market'], {
      unique: true,
      name: 'products_model_grade_capacity_color_market_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
}; 