'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
class Event extends Model {
    static associate(models) {
    this.belongsTo(models.Operator, { foreignKey: 'operatorId' });
    }
};
Event.init({
    operatorId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
        model: 'Operators',
        key: 'id'
    }
    },
    title: {
    type: DataTypes.STRING,
    allowNull: false
    },
    start: {
    type: DataTypes.DATE,
    allowNull: false
    },
    end: {
    type: DataTypes.DATE,
    allowNull: false
    },
    shift: {
    type: DataTypes.STRING,
    allowNull: false
    },
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    job: {
    type: DataTypes.STRING,
    allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Event',
});
return Event;
};
