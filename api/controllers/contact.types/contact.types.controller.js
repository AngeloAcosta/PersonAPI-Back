'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupServices();
    let contactTypesData = await dbService.contactTypeService.doList();

    responseCode = contactTypesData.responseCode;
    responseData = baseController.getSuccessResponse(
        contactTypesData.data,
        contactTypesData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error getting all contact types: ', err);
    responseData = baseController.getErrorResponse('Error getting all contact types.');
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  get
};
