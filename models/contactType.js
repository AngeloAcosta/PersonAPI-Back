'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('../services/database');

module.exports = function setupContactTypeModel(config) {
    const sequelize = setupDatabase(config);

    return sequelize.define('contactType', {
        name: {
            allowNull: false,
            type: Sequelize.STRING(25)
        }
    });
};