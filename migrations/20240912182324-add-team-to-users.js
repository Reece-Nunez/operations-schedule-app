'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'team', {
      type: Sequelize.STRING,
      allowNull: true, // APS users will have this field, but it can be null for others
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'team');
  }
};
