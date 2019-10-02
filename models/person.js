'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupUserModel(config) {
    const sequelize = setupDatabase(config);

    return sequelize.define('person', {});
};