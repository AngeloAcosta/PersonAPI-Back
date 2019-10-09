'use strict';

const setupDatabase = require('../models');
const setupAuthenticationService = require('./authentication.service');
const setupKinshipService = require('./kinship.service');
const setupPersonService = require('./person.service');
const setupUserService = require('./user.service');
const environment = require('./../environment/development.json');

module.exports = async function () {
  const dbInstance = await setupDatabase(environment);

  const authenticationService = setupAuthenticationService();
  const personService = setupPersonService({ 
    contactTypeModel: dbInstance.contactTypeModel,
    countryModel: dbInstance.countryModel,
    documentTypeModel: dbInstance.documentTypeModel,
    genderModel: dbInstance.genderModel,
    personModel: dbInstance.personModel
   });
  const userService = setupUserService(dbInstance.userModel);
  const kinshipService = setupKinshipService(dbInstance.kinshipModel);


  return {
    authenticationService,
    personService,
    userService,
    kinshipService
  };
};
