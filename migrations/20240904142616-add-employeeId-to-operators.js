module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Operators', 'employeeId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Operators', 'employeeId');
  },
};
