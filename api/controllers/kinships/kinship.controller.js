'use strict';

const setupBaseController = require('../base.controller');
const setupServices = require('../../../services');

let baseController = new setupBaseController();

const post = async (request, response) => {
  let responseCode = 500;
  let responseData;

  try {
    let kinship = {
      personId: request.params.personId,
      relativeId: request.params.relativeId,
      kinshipType: request.body.kinshipType
    };
    let dbService = await setupServices();
    let kinshipData = await dbService.kinshipService.create(kinship);

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

const postTest = async (request, response) => {
  let responseCode = 500;
  let responseData;

  try {
    let kinship = {
      personId: request.params.personId,
      relativeId: request.params.relativeId,
      kinshipType: request.body.kinshipType
    };
    let dbService = await setupServices();
    let kinshipData = await dbService.kinshipService.createTest(kinship);

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

module.exports = {
  post,
  postTest
};
