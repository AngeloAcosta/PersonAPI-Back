'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let services = await setupServices();
    let peopleData = await services.personService.findById(request.params.id);

    responseCode = peopleData.responseCode;
    responseData = baseController.getSuccessResponse(
      peopleData.data,
      peopleData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error getting all people: ', err);
    responseData = baseController.getErrorResponse('Error getting all people.');
  }

  return response.status(responseCode).json(responseData);
};

const getKinships = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupServices();
    let personData = await dbService.personService.doListKinships(request.params.id);

    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(
      personData.data,
      personData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error: ', err);
    responseData = baseController.getErrorResponse('Error.');
  }

  return response.status(responseCode).json(responseData);
}

const post = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let services = await setupServices();
    let person = {
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
    let personData = await services.personService.create(person);

    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(
      personData.data,
      personData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('The person wasn\´t registered ' + err);
    responseData = baseController.getErrorResponse('The person wasn\´t registered.');
  }

  return response.status(responseCode).json(responseData);
};

const postKinships = async (request, response) => {
  let responseCode = 500;
  let responseData;

  try {
    let kinship = {
      personId: request.params.id,
      relativeId: request.body.relativeId,
      kinshipType: request.body.kinshipType
    };
    let dbService = await setupServices();
    let kinshipData = await dbService.personService.createKinship(kinship);

    responseCode = kinshipData.responseCode;
    responseData = baseController.getSuccessResponse(
      kinshipData.data,
      kinshipData.message
    );
  } catch (err) {
    console.error('Error creating a new kinship: ', err);
    responseData = baseController.getErrorResponse('Error creating a new kinship');
  }

  return response.status(responseCode).json(responseData);
};
const putKinships = async (request, response) => {
  let responseCode = 500;
  let responseData;

  try {
    let kinship = {
      personId: request.params.id,
      relativeId: request.body.relativeId,
      kinshipType: request.body.kinshipType
    };
    let dbService = await setupServices();
    let kinshipData = await dbService.personService.modifyKinship(kinship);

    responseCode = kinshipData.responseCode;
    responseData = baseController.getSuccessResponse(
      kinshipData.data,
      kinshipData.message
    );
  } catch (err) {
    console.error('Error updating kinship: ', err);
    responseData = baseController.getErrorResponse('Error updating kinship');
  }

  return response.status(responseCode).json(responseData);
};

const postKinshipsTest = async (request, response) => {
  let responseCode = 500;
  let responseData;

  try {
    let kinship = {
      personId: request.params.id,
      relativeId: request.body.relativeId,
      kinshipType: request.body.kinshipType
    };
    let dbService = await setupServices();
    let kinshipData = await dbService.personService.createKinshipTest(kinship);

    responseCode = kinshipData.responseCode;
    responseData = baseController.getSuccessResponse(
      kinshipData.data,
      kinshipData.message
    );
  } catch (err) {
    console.error('Error testing new kinship: ', err);
    responseData = baseController.getErrorResponse('Error testing new kinship');
  }

  return response.status(responseCode).json(responseData);
};

const put = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    let services = await setupServices();
    let id = parseInt(request.params.id);
    let person = {
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
    let personData = await services.personService.modify(id, person);

    responseCode = personData.responseCode;
    responseData = baseController.getSuccessResponse(
      personData.data,
      personData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('The person wasn\´t modified ' + err);
    responseData = baseController.getErrorResponse('The person wasn\´t modified.');
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  get,
  getKinships,
  post,
  postKinships,
  putKinships,
  postKinshipsTest,
  put
};
