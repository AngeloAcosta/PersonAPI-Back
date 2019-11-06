'use strict';

const setupBaseController = require('./../base.controller');
const serviceContainer = require('./../../../services/service.container');

let baseController = new setupBaseController();

const deleteKinships = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const sharedService = await serviceContainer('shared');
    // Get the kinship from the request  
    const personId = request.params.personId && parseInt(request.params.personId);
    const relativeId = request.params.relativeId && parseInt(request.params.relativeId);
    // Delete the kinship
    const personData = await sharedService.deletePersonKinship(personId, relativeId);
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

const doDelete = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const sharedService = await serviceContainer('shared');
    // Get the person id from the route
    const personId = parseInt(request.params.id);
    // Delete person
    const personData = await sharedService.deletePerson(personId);
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

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const personService = await serviceContainer('person');
    // Get person
    let peopleData = await personService.findById(request.params.id);
    // Return data
    responseCode = peopleData.responseCode;
    responseData = baseController.getSuccessResponse(peopleData.data, peopleData.message);
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
    // Inject services
    const sharedService = await serviceContainer('shared');
    // Get the person id from the route
    const personId = request.params.id;
    // Get the person kinships
    const personData = await sharedService.doListPersonKinships(personId);
    // Return the data
    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(personData.data, personData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
}

const getKinshipsTree = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const sharedService = await serviceContainer('shared');
    // Get the person id from the route
    const personId = request.params.id;
    // Get the person kinships tree
    const personData = await sharedService.buildPersonKinshipsTree(personId);
    // Return the data
    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(personData.data, personData.message);
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
    // Inject services
    const personService = await serviceContainer('person');
    // Get person from request body
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
      isGhost: false,
      isDeleted: false
    };
    // Create person
    const personData = await personService.create(person);
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
    // Inject services
    const sharedService = await serviceContainer('shared');
    // Get the kinship from the request
    const kinship = {
      personId: request.params.id && parseInt(request.params.id),
      relativeId: request.body.relativeId && parseInt(request.body.relativeId),
      kinshipType: request.body.kinshipType
    };
    // Create the kinship
    const personData = await sharedService.createPersonKinship(kinship);
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

const postKinshipsTest = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const sharedService = await serviceContainer('shared');
    // Get the kinship from the request
    const kinship = {
      personId: request.params.id && parseInt(request.params.id),
      relativeId: request.body.relativeId && parseInt(request.body.relativeId),
      kinshipType: request.body.kinshipType
    };
    // Test the kinship creation
    const personData = await sharedService.createPersonKinshipTest(kinship);
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

const put = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const personService = await serviceContainer('person');
    // Get the person id from the route
    const personId = parseInt(request.params.id);
    // Get the person from the request body
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
    // Modify person
    const personData = await personService.modify(personId, person);
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

const postRestore = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const personService = await serviceContainer('person');
    // Get the person id from the route
    const personId = parseInt(request.params.id);
    // Restore person
    const personData = await personService.restorePerson(personId);
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
  deleteKinships,
  doDelete,
  get,
  getKinships,
  getKinshipsTree,
  post,
  postKinships,
  postKinshipsTest,
  postRestore,
  put  
};
