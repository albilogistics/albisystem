'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PriceHistory', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      oldPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      newPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      changeType: {
        type: Sequelize.ENUM('manual', 'automatic', 'import'),
        allowNull: false,
        defaultValue: 'automatic'
      },
      changeReason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      marketSettings: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Snapshot of market settings at time of change'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance (after table creation)
    try {
      await queryInterface.addIndex('PriceHistory', ['productId']);
      await queryInterface.addIndex('PriceHistory', ['createdAt']);
      await queryInterface.addIndex('PriceHistory', ['changeType']);
    } catch (error) {
      console.log('Indexes already exist or error creating indexes:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PriceHistory');
  }
}; 