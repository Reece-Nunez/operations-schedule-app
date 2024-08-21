'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'status' column to 'Users' table
    await queryInterface.addColumn('Users', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active',  // Default value for existing users
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'status' column from 'Users' table
    await queryInterface.removeColumn('Users', 'status');
  }
};
