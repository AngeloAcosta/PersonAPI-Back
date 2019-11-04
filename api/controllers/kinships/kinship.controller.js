'use strict';
const setupBaseController = require('../base.controller');
const setupDBService = require('../../../services');

let baseController = new setupBaseController();

const post = async (request, response) => {
  let responseCode = 500;
  let responseData;

  try {
    const kinshipData = {
      ...request.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    let dbService = await setupDBService();
    const newKinshipData = await dbService.kinshipService.create(kinshipData);

    responseCode = newKinshipData.responseCode;
    responseData = baseController.getSuccessResponse(
      newKinshipData.data,
      newKinshipData.message
    );
  } catch (err) {
    console.error('Error creating a new kinship: ', err);
    responseData = baseController.getErrorResponse(
      'Error creating a new kinship'
    );
  }

  return response.status(responseCode).json(responseData);
};

const update = async (request, response) => {
  let responseCode = 500;
  let responseData;

  try {
    const kinshipData = {
      ...request.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    let dbService = await setupDBService();
    const newKinshipData = await dbService.kinshipService.modifyKinship(
      kinshipData
    );

    responseCode = newKinshipData.responseCode;
    responseData = baseController.getSuccessResponse(
      newKinshipData.data,
      newKinshipData.message
    );
  } catch (err) {
    console.error('Error updating kinship: ', err);
    responseData = baseController.getErrorResponse('Error updating kinship');
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  post,
  update
};
