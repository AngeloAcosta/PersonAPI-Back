'use strict';

const setupBaseService = require('./base.service');
const constants = require('./constants');

module.exports = function setupKinshipService(models) {
  const kinshipModel = models.kinshipModel;
  const validationService = models.validationService;
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
      const mIsValidRelative = await validationService.isValidPerson(
        relativeId
      );

      if (mIsValidPerson && mIsValidRelative) {
        const validationResponse = await validationService.kinshipValidations(
          personId,
          relativeId,
          kinshipType
        );
        if (validationResponse.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = 'Errors from data validation';
          baseService.returnData.data = validationResponse;
        } else {
          await validationService.createKinships(
            personId,
            relativeId,
            kinshipType
          );
          baseService.returnData.responseCode = 200;
          baseService.returnData.message = 'Inserting Data Successfully';
          baseService.returnData.data = {};
        }
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message =
          "These people don't exists on the database.";
        baseService.returnData.data = [];
      }
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }
    return baseService.returnData;
  }
  async function modifyKinship(kinshipData) {
    try {
      const personId = kinshipData.personId;
      const relativeId = kinshipData.relativeId;
      const kinshipType = kinshipData.kinshipType;
      const mIsValidPerson = await validationService.isValidPerson(personId);
      const mIsValidRelative = await validationService.isValidPerson(
        relativeId
      );

      if (mIsValidPerson && mIsValidRelative) {
        const validationResponse = await validationService.kinshipValidations(
          personId,
          relativeId,
          kinshipType
        );
        if (validationResponse.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = 'Errors from data validation';
          baseService.returnData.data = validationResponse;
        } else {
          await validationService.modifyKinships(
            personId,
            relativeId,
            kinshipType
          );
          baseService.returnData.responseCode = 200;
          baseService.returnData.message = 'Updating Successfully';
          baseService.returnData.data = {};
        }
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message =
          "These people don't exists on the database.";
        baseService.returnData.data = [];
      }
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }
    return baseService.returnData;
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
    create,
    modifyKinship
  };
};
