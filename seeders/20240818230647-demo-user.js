// seeders/20240818-demo-user.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: 'Clerk',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Nov042011!', 10);

    await queryInterface.bulkInsert('Users', [{
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: 'Clerk',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
