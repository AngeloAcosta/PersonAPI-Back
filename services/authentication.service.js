'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupAuthenticationService() {
  const baseService = new setupBaseService();

  async function login(data) {
   return responseData(baseService);
  }

  async function checkLogin(email, password) {
    return responseData(baseService);
  }

  async function changePassword(password) {
    return responseData(baseService);
  }

  async function resetPassword(email) {
    return responseData(baseService);
  }

  async function logout() {
    return responseData(baseService);
  }
  
  return {
    login,
    checkLogin,
    changePassword,
    logout,
    resetPassword
  };
};

function responseData(baseService){
  baseService.returnData.message = 'Getting data successfully';
  baseService.returnData.responseCode = 200;
  baseService.returnData.data = {};

  return baseService.returnData;
}
