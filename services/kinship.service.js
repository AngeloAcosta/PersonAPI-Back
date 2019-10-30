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

  async function getCouple(personId) {
    const coupleKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.coupleKinshipType.id }
    });
    return coupleKinship && coupleKinship.relative;
  }

  async function getFather(personId) {
    const fatherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    return fatherKinship && fatherKinship.relative;
  }

  async function getMother(personId) {
    const motherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    return motherKinship && motherKinship.relative;
  }

  return {
    doListTypes,
    getCouple,
    getFather,
    getMother
  };
};
