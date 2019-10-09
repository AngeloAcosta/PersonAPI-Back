"use strict";

const setupBaseService = require("./base.service");

module.exports = function setupAuthenticationService() {
  const baseService = new setupBaseService();

  async function login(data) {
    baseService.returnData.message = "Getting data successfully";
    baseService.returnData.responseCode = 200;
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  async function checkLogin(email, password) {
    baseService.returnData.message = "Getting data successfully";
    baseService.returnData.responseCode = 200;
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  async function changePassword(password) {
    baseService.returnData.message = "Getting data successfully";
    baseService.returnData.responseCode = 200;
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  async function resetPassword(email) {
    baseService.returnData.message = "Getting data successfully";
    baseService.returnData.responseCode = 200;
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  async function logout() {
    baseService.returnData.message = "Getting data successfully";
    baseService.returnData.responseCode = 200;
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  return {
    login,
    checkLogin,
    changePassword,
    logout,
    resetPassword
  };
};
