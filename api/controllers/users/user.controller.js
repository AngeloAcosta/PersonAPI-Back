'use strict';

const setupBaseController = require('../base.controller');
const setupDBService = require('../../../services');

let baseController = new setupBaseController();
const dbService = setupDBService();

const get = async (request, response) => {
  if (!request.params.id) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Parameter is missing'));
  }

  let responseCode;
  let responseData;
  let requestedUserId = request.params.id;

  try {
    let userData = await dbService.userService.findById(requestedUserId);

    responseCode = userData.responseCode;
    responseData = baseController.getSuccessResponse(
      userData.data,
      userData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error getting user information: ', err);
    responseData = baseController.getErrorResponse('Error getting user information');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

const getByUid = async (request, response) => {
  if (!request.body.uid) {
    return response
      .status(200)
      .json({
        status: 'OK',
        data: {},
        message: 'Parameters are missing'
      });
  }

  let userData = await dbService
    .userService
    .findByUserId(request.body.uid);

  return response
    .status(200)
    .json({
      status: 'OK',
      data: userData.data,
      message: userData.message
    });
};

const post = async (request, response) => {
  if (!request.body.name ||
    !request.body.lastName ||
    !request.body.email ||
    !request.body.role
  ) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Parameters are missing'));
  }

  const userData = {
    email: request.body.email,
    password: '12345678',
    name: request.body.name,
    lastName: request.body.lastName,
    isAdmin: request.body.isAdmin,
    role: request.body.role
  };

  let responseCode = 500;
  let responseData;

  try {
    const newUserData = await dbService.userService.create(userData);

    responseCode = newUserData.responseCode;
    responseData = baseController.getSuccessResponse(
      newUserData.data,
      newUserData.message
    );
  } catch (err) {
    console.error('Error creating a new user: ', err);
    responseData = baseController.getErrorResponse('Error creating a new user');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

const update = async (request, response) => {
  if (!request.params.id) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Parameter is missing'));
  }

  const userId = request.params.id;
  let userData = {};

  if (request.body.name) {
    userData.name = request.body.name;
  }

  if (request.body.lastName) {
    userData.lastName = request.body.lastName;
  }

  if (request.body.email) {
    userData.email = request.body.email;
  }

  if (request.body.role) {
    userData.role = request.body.role;
  }

  if (request.body.hasOwnProperty('isAdmin')) {
    userData.isAdmin = request.body.isAdmin;
  }

  if (request.body.hasOwnProperty('disabled')) {
    userData.isEnabled = request.body.disabled;
  }

  if (request.body.avatarUrl) {
    userData.avatarUrl = request.body.avatarUrl;
  }

  let responseCode;
  let responseData;

  try {
    const updatedData = await dbService
      .userService
      .update(userId, userData);

    responseCode = updatedData.responseCode;
    responseData = baseController.getSuccessResponse(
      updatedData.data,
      updatedData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error updating user information: ', err);
    responseData = baseController.getErrorResponse('Error updating user information');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

const remove = async (request, response) => {
  if (!request.params.id) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Parameter is missing'));
  }

  let responseCode;
  let responseData;

  try {
    const data = await dbService
      .userService
      .toggleEnable(request.params.id);

    responseCode = data.responseCode;
    responseData = baseController.getSuccessResponse(
      data.data,
      data.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error removing user: ', err);
    responseData = baseController.getErrorResponse('Error removing user');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

const changePassword = async (request, response) => {
  if (!request.body.id ||
    !request.body.uid ||
    !request.body.oldPassword ||
    !request.body.newPassword ||
    !request.body.confirmPassword
  ) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Parameters are missing'));
  }

  let responseCode;
  let responseData;

  try {
    const userInfo = await dbService.userService.findById(request.body.id);

    const checkAuthentication = await dbService.authenticationService.checkLogin(
      userInfo.data.email,
      request.body.oldPassword
    );

    if (!checkAuthentication.data) {
      return response
        .status(401)
        .json({
          status: 'Unauthorized',
          message: checkAuthentication.message
        });
    }

    const updatedUserData = await dbService.authenticationService.changePasswordUsingAdminSDK(
      request.body.uid,
      request.body.newPassword
    );

    if (!updatedUserData.data) {
      return response
        .status(401)
        .json({
          status: 'Unauthorized',
          message: updatedUserData.message
        });
    }

    await dbService.authenticationService.logout();

    const loginData = await dbService.authenticationService.login({
      email: userInfo.data.email,
      password: request.body.newPassword
    });

    responseCode = loginData.responseCode;
    responseData = baseController.getSuccessResponse(
      loginData.data,
      updatedUserData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error changing password: ', err);
    responseData = baseController.getErrorResponse('Error changing password');
  }

  return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {
  get,
  getByUid,
  post,
  update,
  remove,
  changePassword
};
