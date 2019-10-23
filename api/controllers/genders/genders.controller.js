'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupServices();
    let gendersData = await dbService.genderService.doList();

    responseCode = gendersData.responseCode;
    responseData = baseController.getSuccessResponse(
        gendersData.data,
        gendersData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error getting all genders: ', err);
    responseData = baseController.getErrorResponse('Error getting all genders.');
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  get
};
