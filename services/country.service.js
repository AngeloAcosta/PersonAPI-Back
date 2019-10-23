'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupCountryService(countryModel) {
  let baseService = new setupBaseService();

  //#region Helpers
  function getSimpleCountryModel(model) {
    return {
      id: model.id,
      name: model.name
    };
  }
  //#endregion

  async function doList() {
    try {
      const countries = await countryModel.findAll();
      return baseService.getServiceResponse(200, "Success", countries.map(c => getSimpleCountryModel(c)));
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doList
  };
}