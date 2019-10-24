'use strict';

const setupBaseService = require('./base.service');
const constants = require('./constants');

module.exports = function setupKinshipService() {
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
      const kinshipTypes = getKinshipTypes();
      return baseService.getServiceResponse(200, 'Success', kinshipTypes);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doListTypes
  };
};
