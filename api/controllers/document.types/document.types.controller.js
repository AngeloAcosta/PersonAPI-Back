'use strict';

const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupServices();
    let documentTypesData = await dbService.documentTypeService.doList();

    responseCode = documentTypesData.responseCode;
    responseData = baseController.getSuccessResponse(
      documentTypesData.data,
      documentTypesData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error getting all document types: ', err);
    responseData = baseController.getErrorResponse('Error getting all document types.');
  }

  return response.status(responseCode).json(responseData);
};

module.exports = {
  get
};
