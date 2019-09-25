'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./../services/database');

module.exports = function setupUserModel (config) {
    const sequelize = setupDatabase(config);

    return sequelize.define('user', {
        uuid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        }
    });
};