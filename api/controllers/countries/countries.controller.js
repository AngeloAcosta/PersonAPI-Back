'use strict';

const setupBaseController = require('./../base.controller');
const serviceContainer = require('./../../../services/service.container');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const countryService = await serviceContainer('country');
    // Get countries
    const countriesData = await countryService.doList();
    // Return the data
    responseCode = countriesData.responseCode;
    responseData = baseController.getSuccessResponse(countriesData.data, countriesData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

module.exports = {
  get
};
