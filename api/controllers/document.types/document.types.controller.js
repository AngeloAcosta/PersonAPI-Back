'use strict';

const setupBaseController = require('./../base.controller');
const serviceContainer = require('./../../../services/service.container');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const documentTypeService = await serviceContainer('documentType');
    // Get document types
    const documentTypesData = await documentTypeService.doList();
    // Return the data
    responseCode = documentTypesData.responseCode;
    responseData = baseController.getSuccessResponse(documentTypesData.data, documentTypesData.message);
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
