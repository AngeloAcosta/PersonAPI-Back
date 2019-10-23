'use strict';

const setupBaseService = require('./base.service');
const constants = require('./constants');

module.exports = function setupCountryService() {
  let baseService = new setupBaseService();

  //#region Helpers
  function getKinshipTypes() {
    return [
      constants.coupleKinshipType,
      constants.fatherKinshipType,
      constants.motherKinshipType,
      constants.siblingKinshipType,
      constants.paternalGrandfatherKinshipType,
      constants.paternalGrandmotherKinshipType,
      constants.maternalGrandfatherKinshipType,
      constants.maternalGrandmotherKinshipType
    ];
  }
  //#endregion

  async function doListTypes() {
    try {
      const kinships = getKinshipTypes();
      return baseService.getServiceResponse(200, "Success", kinships);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doListTypes
  };
}