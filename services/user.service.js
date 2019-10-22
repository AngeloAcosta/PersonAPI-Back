'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupUserService(userModel) {
  const model = userModel;

  let baseService = new setupBaseService();

  async function create(userData) {
    baseService.responseData(200,'Getting data successfully');
    return baseService.returnData;
  }

  async function doList() {
    try {
      const users = await userModel.findAll();
      baseService.responseData(200,'Getting data successfully',users);
    } catch (err) {
      console.log('Error: ', err);
      baseService.responseData(500,err,[]);
    }

    return baseService.returnData;
  }

  async function findById(id) {
    baseService.responseData(200,'Getting data successfully');
    return baseService.returnData;
  }

  async function update(userId, userData) {
    baseService.responseData(200,'Getting data successfully',[]);

    return baseService.returnData;
  }

  return {
    create,
    doList,
    findById,
    update
  };
};
