'use strict';

const setupBaseController = require('./../base.controller');
const serviceContainer = require('./../../../services/service.container');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const genderService = await serviceContainer('gender');
    // Get genders
    const gendersData = await genderService.doList();
    // Return the data
    responseCode = gendersData.responseCode;
    responseData = baseController.getSuccessResponse(gendersData.data, gendersData.message);
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
