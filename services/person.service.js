'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupPersonService(model) {

  let baseService = new setupBaseService();

  async function doList() {
    try {
      const people = await model.findAll();

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = people;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  return {
    doList
  };


};
