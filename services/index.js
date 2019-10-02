'use strict';

const setupDatabase = require('../models');
const setupUserService = require('./user.service');
const setupAuthenticationService = require('./authentication.service');
const environment = require('./../environment/development.json');

module.exports = function () {
  const dbInstance = setupDatabase(environment);

  const authenticationService = setupAuthenticationService();
  const userService = setupUserService(dbInstance.userModel);

  return {
    authenticationService,
    userService
  };
};
