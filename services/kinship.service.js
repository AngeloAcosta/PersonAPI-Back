'use strict';

const constants = require('./constants');
const setupBaseService = require('./base.service');

module.exports = function setupKinshipService(kinshipModel) {
  let baseService = new setupBaseService();

  async function doListTypes() {
    // Get the kinship types from the constants
    const kinshipTypes = [
      constants.coupleKinshipType,
      constants.fatherKinshipType,
      constants.motherKinshipType,
      constants.siblingKinshipType,
      constants.paternalGrandfatherKinshipType,
      constants.paternalGrandmotherKinshipType,
      constants.maternalGrandfatherKinshipType,
      constants.maternalGrandmotherKinshipType
    ];
    // Return 200
    return baseService.getServiceResponse(200, 'Success', kinshipTypes);
  }

  return {
    doListTypes
  };
};
