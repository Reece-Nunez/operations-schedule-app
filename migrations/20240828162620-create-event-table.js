'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Operators', // References the Operator table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      shift: {
        type: Sequelize.STRING,
        allowNull: false
      },
      published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      job: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Events');
  }
};
