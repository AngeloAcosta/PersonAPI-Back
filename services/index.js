'use strict';

const setupDatabase = require('./../models');
const setupAuthenticationService = require('./authentication.service');
const setupContactTypeService = require('./contact.type.service');
const setupCountryService = require('./country.service');
const setupDocumentTypeService = require('./document.type.service');
const setupGenderService = require('./gender.service');
const setupKinshipService = require('./kinship.service');
const setupPersonService = require('./person.service');
const setupSharedService = require('./shared.service');
const setupUserService = require('./user.service');

module.exports = async function () {
  const dbInstance = await setupDatabase();
  const sharedService = setupSharedService({
    kinshipModel: dbInstance.kinshipModel,
    personModel: dbInstance.personModel
  });
  const authenticationService = setupAuthenticationService();
  const contactTypeService = setupContactTypeService(dbInstance.contactTypeModel);
  const countryService = setupCountryService(dbInstance.countryModel);
  const documentTypeService = setupDocumentTypeService(dbInstance.documentTypeModel);
  const genderService = setupGenderService(dbInstance.genderModel);
  const kinshipService = setupKinshipService({
    kinshipModel: dbInstance.kinshipModel,
    personModel: dbInstance.personModel,
    sharedService
  });
  const personService = setupPersonService({
    contactTypeModel: dbInstance.contactTypeModel,
    countryModel: dbInstance.countryModel,
    documentTypeModel: dbInstance.documentTypeModel,
    genderModel: dbInstance.genderModel,
    personModel: dbInstance.personModel,
    sharedService
  });
  const userService = setupUserService(dbInstance.userModel);

  return {
    authenticationService,
    contactTypeService,
    countryService,
    documentTypeService,
    genderService,
    kinshipService,
    personService,
    userService
  };
};
