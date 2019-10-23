'use strict';

const setupBaseService = require('./base.service');
const constants = require('./constants');

module.exports = function setupKinshipService(validationService) {
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

  async function create(kinshipData) {
    try {
      const personId = kinshipData.personId;
      const relativeId = kinshipData.relativeId;
      const kinshipType = kinshipData.kinshipType;

      const mIsValidPerson = await validationService.isValidPerson(personId);
      const mIsValidRelative = await validationService.isValidPerson(relativeId);

      if (mIsValidPerson && mIsValidRelative) {
        const validationResponse = await validationService.kinshipValidations(
          personId,
          relativeId,
          kinshipType
        );
        if (validationResponse.length) {
          return baseService.getServiceResponse(400, validationResponse, {});
        } else {
          await validationService.createKinships(
            personId,
            relativeId,
            kinshipType
          );
          return baseService.getServiceResponse(200, 'Success', {});
        }
      } else {
        return baseService.getServiceResponse(400, 'These people don\'t exists on the database.', {});
      }
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

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
    doListTypes,
    create
  };
};
