'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

const baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get the query
    const query = request.query.query || '';
    // Get kinships
    const kinshipsData = await services.sharedService.doListKinships(query);
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
    const services = await setupServices();
    // Get the kinship types
    const kinshipsData = await services.kinshipService.doListTypes();
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
