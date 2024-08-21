'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Operators', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: 'default@example.com'  // Provide a default value
    });
    await queryInterface.addColumn('Operators', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Operator'  // Provide a default value
    });
    await queryInterface.addColumn('Operators', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active'  // Provide a default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Operators', 'email');
    await queryInterface.removeColumn('Operators', 'role');
    await queryInterface.removeColumn('Operators', 'status');
  }
};
