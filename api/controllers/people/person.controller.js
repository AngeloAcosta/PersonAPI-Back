'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

const baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Find the person
    let personData = await services.personService.findById(request.params.id);
    // Return the data
    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(personData.data, personData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

const getKinships = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get person
    const person = await services.personService.personModel.findOne({ where: { id: request.params.id } });
    // If person doesn't exist, return 404
    if (!person || person.isGhost) {
      responseCode = 404;
      responseData = baseController.getSuccessResponse({}, 'Not found');
    }
    // Else, get their kinships, and return the data
    else {
      const kinships = await services.sharedService.getPersonKinships(person);
      responseCode = 200;
      responseData = baseController.getSuccessResponse(kinships, 'Success');
    }
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
}

const post = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get the person from the body
    const person = {
      name: request.body.name && request.body.name.trim(),
      lastName: request.body.lastName && request.body.lastName.trim(),
      birthdate: request.body.birthdate && request.body.birthdate.trim(),
      documentTypeId: request.body.documentTypeId && parseInt(request.body.documentTypeId),
      document: request.body.document && request.body.document.trim(),
      genderId: request.body.genderId && parseInt(request.body.genderId),
      countryId: request.body.countryId && parseInt(request.body.countryId),
      contactType1Id: request.body.contactType1Id && parseInt(request.body.contactType1Id),
      contact1: request.body.contact1 && request.body.contact1.trim(),
      contactType2Id: request.body.contactType2Id && parseInt(request.body.contactType2Id),
      contact2: request.body.contact2 && request.body.contact2.trim(),
      isGhost: false
    };
    // Create them
    const personData = await services.personService.create(person);
    // Return the data
    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(personData.data, personData.message);
  } catch (err) {
    console.error('Error ' + err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

const postKinships = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get the kinship from the request
    const kinship = {
      personId: request.params.id && parseInt(request.params.id),
      relativeId: request.body.relativeId && parseInt(request.body.relativeId),
      kinshipType: request.body.kinshipType
    };
    // Create the kinship
    const kinshipData = await services.personService.createKinship(kinship, services.sharedService.getPersonKinships);
    // Return the data
    responseCode = kinshipData.responseCode;
    responseData = baseController.getSuccessResponse(kinshipData.data, kinshipData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

const postKinshipsTest = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get the kinship from the request
    const kinship = {
      personId: request.params.id && parseInt(request.params.id),
      relativeId: request.body.relativeId && parseInt(request.body.relativeId),
      kinshipType: request.body.kinshipType
    };
    // Test the kinship creation
    const kinshipData = await services.personService.createKinshipTest(kinship, services.sharedService.getPersonKinships);
    // Return the data
    responseCode = kinshipData.responseCode;
    responseData = baseController.getSuccessResponse(kinshipData.data, kinshipData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

const put = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get the person id
    const personId = parseInt(request.params.id);
    // Get the person from the body
    const person = {
      name: request.body.name && request.body.name.trim(),
      lastName: request.body.lastName && request.body.lastName.trim(),
      birthdate: request.body.birthdate && request.body.birthdate.trim(),
      documentTypeId: request.body.documentTypeId && parseInt(request.body.documentTypeId),
      document: request.body.document && request.body.document.trim(),
      countryId: request.body.countryId && parseInt(request.body.countryId),
      contactType1Id: request.body.contactType1Id && parseInt(request.body.contactType1Id),
      contact1: request.body.contact1 && request.body.contact1.trim(),
      contactType2Id: request.body.contactType2Id && parseInt(request.body.contactType2Id),
      contact2: request.body.contact2 && request.body.contact2.trim(),
    };
    // Modify them
    const personData = await services.personService.modify(personId, person);
    // Return the data
    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(personData.data, personData.message);
  } catch (err) {
    console.error('Error: ' + err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

module.exports = {
  get,
  getKinships,
  post,
  postKinships,
  postKinshipsTest,
  put
};
