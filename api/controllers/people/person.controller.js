'use strict';

const setupBaseController = require('./../base.controller');
const setupDBService = require('./../../../services');

let baseController = new setupBaseController();

const put = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    let dbService = await setupDBService();
    let personmModifiedData = await dbService.personService.modifyPerson(
      request
    );
    responseCode = personmModifiedData.responseCode;
    responseData = baseController.getSuccessResponse(
      personmModifiedData.data,
      personmModifiedData.message
    );
  } catch (err) {
    responseCode = 500;
    console.log('Error processing the update:', err);
    responseData = baseController.getErrorResponse(
      'Error processing the update.'
    );
  }

  return response.status(responseCode).json(responseData);
};
