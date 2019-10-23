'use strict';

const setupDatabase = require('./../models');
const setupAuthenticationService = require('./authentication.service');
const setupKinshipService = require('./kinship.service');
const setupContactTypeService = require('./contact.type.service');
const setupDocumentTypeService = require('./document.type.service');
const setupPersonService = require('./person.service');
const setupUserService = require('./user.service');
const setupValidationService = require('./validation.service');

module.exports = async function () {
  const dbInstance = await setupDatabase();

  const validationService = setupValidationService({
    kinshipModel: dbInstance.kinshipModel,
    personModel: dbInstance.personModel
  });
  const authenticationService = setupAuthenticationService();
  const contactTypeService = setupContactTypeService(dbInstance.contactTypeModel);
  // TODO: Country service
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
    kinshipModel: dbInstance.kinshipModel,
    validationService
  });


  return {
    authenticationService,
    contactTypeService,
    documentTypeService,
    personService,
    userService,
    kinshipService
  };
};
