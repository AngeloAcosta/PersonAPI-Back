'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const constants = require('./constants');

const Op = Sequelize.Op;

module.exports = function setupKinshipService(dependencies) {
  let baseService = new setupBaseService();
  const personModel = dependencies.personModel;
  const sharedService = dependencies.sharedService;

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

  async function doList(requestQuery) {
    try {
      let listKinships = []
      const qQueryWhereClause = { [Op.like]: `%${requestQuery.query}%` };
      const personId = await personModel.findAll({
        where: {
          [Op.or]: [
            { name: qQueryWhereClause },
            { lastName: qQueryWhereClause }
          ]
        }
      });
      for (let i = 0; i < personId.length; i++) {
        let kinships = await sharedService.getPersonKinships(personId[i]);
        if (kinships.length > 0) {
          listKinships = listKinships.concat(kinships);
        }
      }
      return baseService.getServiceResponse(200, "List Kinships", listKinships);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
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
    doList,
    doListTypes
  };
}
