'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Operators', 'team', {
      type: Sequelize.STRING,
      allowNull: true,  // or false if you want it to be required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Operators', 'team');
  }
};
