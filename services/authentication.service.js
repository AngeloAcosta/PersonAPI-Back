'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupAuthenticationService() {
  const baseService = new setupBaseService();

  async function login(data) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function checkLogin(email, password) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function changePassword(password) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function resetPassword(email) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function logout() {
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


