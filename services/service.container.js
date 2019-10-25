'use strict';

const setupServices = require('./');

let services;

module.exports = async function serviceContainer(serviceName) {
  if (!services) {
    services = await setupServices();
  }
  // Return requested service
  switch (serviceName) {
    case 'authentication':
      return services.authenticationService;
    case 'contactType':
      return services.contactTypeService;
    case 'country':
      return services.countryService;
    case 'documentType':
      return services.documentTypeService;
    case 'gender':
      return services.genderService;
    case 'kinship':
      return services.kinshipService;
    case 'person':
      return services.personService;
    case 'user':
      return services.userService;
    case 'validation':
      return services.validationService;
  }
}