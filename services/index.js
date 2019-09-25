'use strict';

const setupDatabase = require('./database');

const setupUserService = require('./user.service');
const setupAuthenticationService = require('./authentication.service');

module.exports = function () {

  const firebase = setupDatabase();

  const authenticationService = setupAuthenticationService();
  const userService = setupUserService();

  return {
    authenticationService,
    userService
  };
};
