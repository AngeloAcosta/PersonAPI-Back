'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupUserService(userModel) {

  const model = userModel;

  let baseService = new setupBaseService();

  async function create(userData) {
    
    baseService.returnData.responseCode = 200;
    baseService.returnData.message = 'Getting data successfully';
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  async function doList() {
    try {

      const users = await userModel.findAll();

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = users;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  async function findById(id) {
    baseService.returnData.responseCode = 200;
    baseService.returnData.message = 'Getting data successfully';
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  async function update(userId, userData) {
    baseService.returnData.responseCode = 200;
    baseService.returnData.message = 'Getting data successfully';
    baseService.returnData.data = [];

    return baseService.returnData;
  }

  return {
    create,
    doList,
    findById,
    update
  };
};
