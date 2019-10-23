'use strict';

const setupBaseService = require('./base.service');
const setupPersonService = require('./person.service');

module.exports = function setupKinshipService(models) {
  const kinshipModel = models.kinshipModel;
  const validationService = models.validationService;
  let baseService = new setupBaseService();

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
          'These people dont exists on the database.';
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

  async function doList() {
    try {
      const kinships = await kinshipModel.findAll();
      const searchSpace = await validationService.searchSpace();
      console.log(searchSpace);
      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = kinships;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  async function findById(id) {
    try {
      console.log(id);

      const kinship = await kinshipModel.findOne({
        where: {
          id
        }
      });

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = kinship;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  return {
    doList,
    findById,
    create
  };
};
