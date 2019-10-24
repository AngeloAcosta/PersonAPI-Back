'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupServices();
    let query = request.query.query || '';

    let kinshipsData = await dbService.kinshipService.doList({ query });

    responseCode = kinshipsData.responseCode;
    responseData = baseController.getSuccessResponse(
      kinshipsData.data, kinshipsData.message
    );

  } catch (err) {
    responseCode = 500;
    console.error('Error getting all kinships: ', err);
    responseData = baseController.getErrorResponse('Error getting all kindships.');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

const getTypes = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupServices();
    let kinshipsData = await dbService.kinshipService.doListTypes();

    responseCode = kinshipsData.responseCode;
    responseData = baseController.getSuccessResponse(
      kinshipsData.data,
      kinshipsData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error getting all kinship types: ', err);
    responseData = baseController.getErrorResponse('Error getting all kinship types.');
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  get,
  getTypes
};
