"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FatiguePolicy extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  FatiguePolicy.init(
    {
      maxConsecutiveShifts: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minRestAfterMaxShifts: {
        type: DataTypes.INTEGER, // in hours
        allowNull: false,
      },
      maxConsecutiveNightShifts: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minRestAfterNightShifts: {
        type: DataTypes.INTEGER, // in hours
        allowNull: false,
      },
      minRestAfter3Shifts: {
        type: DataTypes.INTEGER, // in hours
        allowNull: false,
      },
      shiftLengthHours: {
        type: DataTypes.INTEGER, // default shift length in hours
        allowNull: false,
      },
      maxHoursInDay: {
        type: DataTypes.INTEGER, // maximum hours in a day considered continuous
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "FatiguePolicy",
      tableName: "fatigue_policy",
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );

  return FatiguePolicy;
};
