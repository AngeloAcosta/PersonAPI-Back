'use strict';

const setupDatabase = require('../models');
const setupUserService = require('./user.service');
const setupAuthenticationService = require('./authentication.service');
const environment = require('./../environment/development.json');

module.exports = async function () {
  const dbInstance = await setupDatabase(environment);

  const authenticationService = setupAuthenticationService();
  const personService = setupPersonService(dbInstance.personModel);
  const userService = setupUserService(dbInstance.userModel);

  return {
    authenticationService,
    personService,
    userService
  };
};
