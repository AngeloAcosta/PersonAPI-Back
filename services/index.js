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
  const authenticationService = setupAuthenticationService();
  const contactTypeService = setupContactTypeService(dbInstance.contactTypeModel);
  const countryService = setupCountryService(dbInstance.countryModel);
  const documentTypeService = setupDocumentTypeService(dbInstance.documentTypeModel);
  const genderService = setupGenderService(dbInstance.genderModel);
  const kinshipService = setupKinshipService(dbInstance.kinshipModel);
  const personService = setupPersonService(dbInstance.personModel);
  const sharedService = setupSharedService({ kinshipModel: dbInstance.kinshipModel, personModel: dbInstance.personModel });
  const userService = setupUserService(dbInstance.userModel);

  return {
    authenticationService,
    contactTypeService,
    countryService,
    documentTypeService,
    genderService,
    kinshipService,
    personService,
    sharedService,
    userService
  };
};
