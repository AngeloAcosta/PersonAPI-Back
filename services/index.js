'use strict';

const setupDatabase = require('./database');
const setupUserService = require('./user.service');
const setupAuthenticationService = require('./authentication.service');

module.exports = function (config) {
  const dbInstance = setupDatabase(config);

  const authenticationService = setupAuthenticationService();
  const personService = setupPersonService(dbInstance.models.person);
  const userService = setupUserService();

  return {
    authenticationService,
    personService,
    userService
  };
};
