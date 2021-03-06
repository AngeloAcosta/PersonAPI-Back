'use strict';

const setupBaseController = require('./../base.controller');
const serviceContainer = require('./../../../services/service.container');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    // Inject services
    const contactTypeService = await serviceContainer('contactType');
    // Get contact types
    const contactTypesData = await contactTypeService.doList();
    // Return the data
    responseCode = contactTypesData.responseCode;
    responseData = baseController.getSuccessResponse(contactTypesData.data, contactTypesData.message);
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
