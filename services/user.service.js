'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupUserService(userModel) {
  let baseService = new setupBaseService();

  async function create(userData) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function doList() {
    try {
      const users = await userModel.findAll();
      return baseService.getServiceResponse(200, 'Success', users);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, 'Error', {});
    }
  }

  async function findById(id) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function update(userId, userData) {
    return baseService.getServiceResponse(200, 'Success', {});
  }

  return {
    create,
    doList,
    findById,
    update
  };
};
