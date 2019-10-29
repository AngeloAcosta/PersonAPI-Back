'use strict';

const setupBaseController = require('./../base.controller');
const serviceContainer = require('./../../../services/service.container');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const sharedService = await serviceContainer('shared');
    // Get the query
    const query = request.query.query || '';
    // Get kinships
    const kinshipsData = await sharedService.doListKinships(query);
    // Return the data
    responseCode = kinshipsData.responseCode;
    responseData = baseController.getSuccessResponse(kinshipsData.data, kinshipsData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

const getTypes = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const kinshipService = await serviceContainer('kinship');
    // Get the kinship types
    const kinshipsData = await kinshipService.doListTypes();
    // Return the data
    responseCode = kinshipsData.responseCode;
    responseData = baseController.getSuccessResponse(kinshipsData.data, kinshipsData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

module.exports = {
  get,
  getTypes
};
