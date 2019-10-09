"use strict";

const Sequelize = require("sequelize");
const setupDatabase = require("./database");

module.exports = function setupCountryModel(config) {
  const sequelize = setupDatabase(config);

  return sequelize.define("country", {
    name: {
      allowNull: false,
      type: Sequelize.STRING(25)
    }
  });
};
