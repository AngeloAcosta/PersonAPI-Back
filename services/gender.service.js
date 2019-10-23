'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupGenderService(genderModel) {
  let baseService = new setupBaseService();

  //#region Helpers
  function getSimpleGenderModel(model) {
    return {
      id: model.id,
      name: model.name
    };
  }
  //#endregion

  async function doList() {
    try {
      const genders = await genderModel.findAll();
      return baseService.getServiceResponse(200, "Success", genders.map(g => getSimpleGenderModel(g)));
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doList
  };
}