'use strict';

const setupDatabase = require('./../models');
const setupAuthenticationService = require('./authentication.service');
const setupKinshipService = require('./kinship.service');
const setupDocumentTypeService = require('./document.type.service');
const setupPersonService = require('./person.service');
const setupUserService = require('./user.service');
const setupValidationService = require('./validation.service');

module.exports = async function () {
  const dbInstance = await setupDatabase();
  const validationService = setupValidationService();
  const authenticationService = setupAuthenticationService();
  // TODO: Country service
  // TODO: Contact service
  const documentTypeService = setupDocumentTypeService(dbInstance.documentTypeModel);
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
    documentTypeService,
    personService,
    userService,
    kinshipService
  };
};
