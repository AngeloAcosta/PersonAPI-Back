'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupAuthenticationService() {
  const baseService = new setupBaseService();

  function login(data) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  function checkLogin(email, password) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  function changePassword(password) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  function resetPassword(email) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  function logout() {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  return {
    login,
    checkLogin,
    changePassword,
    logout,
    resetPassword
  };
};
