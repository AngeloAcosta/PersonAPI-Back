'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupKinshipModel(config) {
    const sequelize = setupDatabase(config);
    const kinship = sequelize.define('kinship', {
        personId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'people',
                key: 'id'
            }
        },
        relativeId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'people',
                key: 'id'
            }
        },
        kinshipType: {
            allowNull: false,
            type: Sequelize.CHAR(1)
        }
    });
    kinship.associate = function (models) {
        kinship.belongsTo(models.person, {as: 'person'});
        kinship.belongsTo(models.person, {as: 'relative'});
    }
    return kinship;
};