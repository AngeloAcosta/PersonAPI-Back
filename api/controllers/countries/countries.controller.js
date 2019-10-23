'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupServices();
    let countriesData = await dbService.countryService.doList();

    responseCode = countriesData.responseCode;
    responseData = baseController.getSuccessResponse(
        countriesData.data,
        countriesData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error getting all countries: ', err);
    responseData = baseController.getErrorResponse('Error getting all countries.');
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  get
};
