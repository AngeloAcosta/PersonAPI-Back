'use strict';

const setupDatabase = require('./../models');
const setupAuthenticationService = require('./authentication.service');
const setupContactTypeService = require('./contact.type.service');
const setupCountryService = require('./country.service');
const setupDocumentTypeService = require('./document.type.service');
const setupGenderService = require('./gender.service');
const setupPersonService = require('./person.service');
const setupUserService = require('./user.service');
const setupValidationService = require('./validation.service');

module.exports = async function () {
  const dbInstance = await setupDatabase();
  const validationService = setupValidationService();
  const authenticationService = setupAuthenticationService();
  const contactTypeService = setupContactTypeService(dbInstance.contactTypeModel);
  const countryService = setupCountryService(dbInstance.countryModel);
  const documentTypeService = setupDocumentTypeService(dbInstance.documentTypeModel);
  const genderService = setupGenderService(dbInstance.genderModel);
  // TODO: Kinship type service
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

  return {
    authenticationService,
    contactTypeService,
    countryService,
    documentTypeService,
    genderService,
    personService,
    userService
  };
};
