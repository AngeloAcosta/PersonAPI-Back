'use strict';

const setupDatabase = require('./../models');
const setupAuthenticationService = require('./authentication.service');
const setupPersonService = require('./person.service');
const setupUserService = require('./user.service');
const environment = require('./../environment/development.json');

module.exports = async function () {
  const dbInstance = await setupDatabase(environment);

  const authenticationService = setupAuthenticationService();
  const personService = setupPersonService(dbInstance);
  const userService = setupUserService(dbInstance);

  return {
    authenticationService,
    personService,
    userService
  };
};
