'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./../services/database');

module.exports = function setupUserModel(config) {
    const sequelize = setupDatabase(config);

    return sequelize.define('person', {});
};