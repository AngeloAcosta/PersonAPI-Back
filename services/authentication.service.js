'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupAuthenticationService() {
  const baseService = new setupBaseService();

  async function login(data) {
    return baseService.responseData();
  }

  async function checkLogin(email, password) {
    return baseService.responseData();
  }

  async function changePassword(password) {
    return baseService.responseData();
  }

  async function resetPassword(email) {
    return baseService.responseData();
  }

  async function logout() {
    return baseService.responseData();
  }
  
  return {
    login,
    checkLogin,
    changePassword,
    logout,
    resetPassword
  };
};


