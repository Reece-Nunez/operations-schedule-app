'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Operator extends Model {
    static associate(models) {
      // define association here
    }
  };
  Operator.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    letter: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    jobs: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Operator',
  });
  return Operator;
};
