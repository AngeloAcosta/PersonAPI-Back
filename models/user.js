'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupUserModel(config) {
  const sequelize = setupDatabase(config);

  return sequelize.define('user', {
    uuid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING(25),
      allowNull: false
    },
    firstName: {
      type: Sequelize.STRING(25),
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING(25),
      allowNull: false
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  });
};