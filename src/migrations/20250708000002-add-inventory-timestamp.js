'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'inventoryLastUpdated', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last inventory update from scraper'
    });

    await queryInterface.addColumn('Products', 'priceLastUpdated', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last price calculation update'
    });

    await queryInterface.addColumn('Products', 'marketSettingsSnapshot', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Snapshot of market settings used for last price calculation'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'inventoryLastUpdated');
    await queryInterface.removeColumn('Products', 'priceLastUpdated');
    await queryInterface.removeColumn('Products', 'marketSettingsSnapshot');
  }
}; 