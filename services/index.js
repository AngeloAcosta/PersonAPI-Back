'use strict';

const setupDatabase = require('./../models');
const setupAuthenticationService = require('./authentication.service');
const setupKinshipService = require('./kinship.service');
const setupPersonService = require('./person.service');
const setupUserService = require('./user.service');
const setupValidationService = require('./validation.service');
<<<<<<< HEAD
const environment = require('./../environment/development.json');
=======
>>>>>>> develop

module.exports = async function () {
  const dbInstance = await setupDatabase();
<<<<<<< HEAD

  const validationService = setupValidationService({
    kinshipModel: dbInstance.kinshipModel,
    personModel: dbInstance.personModel
  })
=======
  const validationService = setupValidationService();
>>>>>>> develop
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
    kinshipModel: dbInstance.kinshipModel,
    personModel: dbInstance.personModel
  });
  const userService = setupUserService(dbInstance.userModel);
  const kinshipService = setupKinshipService({
    personModel: dbInstance.personModel,
    kinshipModel: dbInstance.kinshipModel,
    validationService
  });


  return {
    authenticationService,
    personService,
    userService,
    kinshipService
  };
};
