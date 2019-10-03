'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./../services/database');

module.exports = function setupNationalityModel(config) {
    const sequelize = setupDatabase(config);

    return sequelize.define('nationality', {
        name: {
            allowNull: false,
            type: Sequelize.STRING(25)
        }
    });
};