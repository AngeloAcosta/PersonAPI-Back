'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('./database');

module.exports = function setupGenderModel(config) {
  const sequelize = setupDatabase(config);

  return sequelize.define('gender', {
    name: {
      allowNull: false,
      type: Sequelize.STRING(25)
    }
  });
};