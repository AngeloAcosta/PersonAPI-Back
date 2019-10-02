'use strict';

const setupBaseController = require('./../base.controller');
const setupDBService = require('./../../../services');

let baseController = new setupBaseController();
const dbService = setupDBService();

const get = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let usersData = await dbService.userService.doList();

    responseCode = usersData.responseCode;
    responseData = baseController.getSuccessResponse(
      usersData.data, usersData.message
    );

  } catch (err) {
    responseCode = 500;
    console.error('Error getting all users: ', err);
    responseData = baseController.getErrorResponse('Error getting all users.');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {
  get
};
