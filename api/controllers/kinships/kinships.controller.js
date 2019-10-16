'use strict';

const setupBaseController = require('./../base.controller');
const setupDBService = require('./../../../services');

let baseController = new setupBaseController();
const dbService = setupDBService();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let dbService = await setupDBService();
    let limit = parseInt(request.query.limit) || 20;
    let offset = parseInt(request.query.offset) || 0;
    let query = request.query.query || '';
    let orderBy = parseInt(request.query.orderBy) || 1;
    let orderType = parseInt(request.query.orderType) || 1;
    let kinshipsData = await dbService.kinshipService.doList({ limit, offset, query, orderBy, orderType });

    responseCode = kinshipsData.responseCode;
    responseData = baseController.getSuccessResponse(
        kinshipsData.data, kinshipsData.message
    );

  } catch (err) {
    responseCode = 500;
    console.error('Error getting all kinships: ', err);
    responseData = baseController.getErrorResponse('Error getting all kindships.');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {
  get
};
