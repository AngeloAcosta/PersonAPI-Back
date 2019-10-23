'use strict';

const setupDatabase = require('./../models');
const setupAuthenticationService = require('./authentication.service');
const setupPersonService = require('./person.service');
const setupUserService = require('./user.service');
const setupValidationService = require('./validation.service');

module.exports = async function () {
  const dbInstance = await setupDatabase();
  const validationService = setupValidationService();
  const authenticationService = setupAuthenticationService();
  // TODO: Country service
  // TODO: Contact service
  // TODO: Document service
  // TODO: Gender service
  const personService = setupPersonService({
    validationService,
    contactTypeModel: dbInstance.contactTypeModel,
    countryModel: dbInstance.countryModel,
    documentTypeModel: dbInstance.documentTypeModel,
    genderModel: dbInstance.genderModel,
    personModel: dbInstance.personModel
  });
  const userService = setupUserService(dbInstance.userModel);

  return {
    authenticationService,
    personService,
    userService
  };
};
