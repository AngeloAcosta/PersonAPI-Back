'use strict';

const setupBaseController = require('./../base.controller');
const setupDBService = require('./../../../database');

let baseController = new setupBaseController();
const dbService = setupDBService();

const login = async (request, response) => {
  if (!request.body.email || !request.body.password) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Paramaters are missing'));
  }

  let responseCode;
  let responseData;

  try {
    let authenticationData = {
      email: request.body.email,
      password: request.body.password
    };

    let loginData = await dbService.authenticationService.login(authenticationData);

    const user = await dbService.userService.findByUserId(loginData.data.uid);

    loginData.data.user = user.data;

    responseCode = loginData.responseCode;
    responseData = baseController.getSuccessResponse(loginData.data, loginData.message);
  } catch (err) {
    console.error('Error logging in the application: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error logging in the application');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

const logout = async (request, response) => {
  let responseCode;
  let responseData;

  try {
    let loginData = await dbService.authenticationService.logout();

    responseCode = loginData.responseCode;
    responseData = baseController.getSuccessResponse(
      loginData.data,
      loginData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error logging out the app: ', err);
    responseData = baseController.getErrorResponse('Error logging out the app');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

const resetPassword = async (request, response) => {
  if (!request.body.email) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Email parameter is missing'));
  }

  let responseCode;
  let responseData;

  try {
    let authenticationData = await dbService
      .authenticationService
      .resetPassword(request.body.email);

    responseCode = authenticationData.responseCode;
    responseData = baseController.getSuccessResponse(
      authenticationData.data,
      authenticationData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error resetting password: ', err);
    responseData = baseController.getErrorResponse('Error resetting password');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {
  login,
  logout,
  resetPassword
};
