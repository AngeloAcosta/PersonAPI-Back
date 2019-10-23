'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupContactTypeService(contactTypeModel) {
  let baseService = new setupBaseService();

  //#region Helpers
  function getSimpleContactTypeModel(model) {
    return {
      id: model.id,
      name: model.name
    };
  }
  //#endregion

  async function doList() {
    try {
      const contactTypes = await contactTypeModel.findAll();
      return baseService.getServiceResponse(200, "Success", contactTypes.map(cT => getSimpleContactTypeModel(cT)));
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doList
  };
}