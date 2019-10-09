'use strict';

const setupBaseController = require('./../base.controller');
const setupDBService = require('./../../../services');

let baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let limit = parseInt(request.query.limit) || 20;
    let offset = parseInt(request.query.offset) || 0;
    let query = request.query.query || '';
    let orderBy = parseInt(request.query.orderBy) || 1;
    let orderType = parseInt(request.query.orderType) || 1;
    let dbService = await setupDBService();
    let peopleData = await dbService.personService.doList({ limit, offset, query, orderBy, orderType });

    responseCode = peopleData.responseCode;
    responseData = baseController.getSuccessResponse(
      peopleData.data, peopleData.message
    );

  } catch (err) {
    responseCode = 500;
    console.error('Error getting all people: ', err);
    responseData = baseController.getErrorResponse('Error getting all people.');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {
  get
};
