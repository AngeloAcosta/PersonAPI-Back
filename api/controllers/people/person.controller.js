'use strict';

const setupBaseController = require('./../base.controller');
const setupDBService = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupDBService();
    let peopleData = await dbService.personService.findById(request.params.id);

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
    let dbService = await setupDBService();
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
    let dbService = await setupDBService();
    let personCreateData = await dbService.personService.create(request);

    responseCode = personCreateData.responseCode;
    responseData = baseController.getSuccessResponse(
      personCreateData.data,
      personCreateData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('The person wasn\´t registered ' + err);
    responseData = baseController.getErrorResponse(
      'The person wasn\´t registered'
    );
  }

  return response.status(responseCode).json(responseData);
};

const put = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    let dbService = await setupDBService();
    let personmModifiedData = await dbService.personService.modifyPerson(
      request
    );
    responseCode = personmModifiedData.responseCode;
    responseData = baseController.getSuccessResponse(
      personmModifiedData.data,
      personmModifiedData.message
    );
  } catch (err) {
    responseCode = 500;
    console.log('Error processing the update:', err);
    responseData = baseController.getErrorResponse(
      'Error processing the update.'
    );
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  get,
  getKinships,
  post,
  put
};
