'use strict';

const setupBaseService = require('./base.service');
const setupPersonService = require('./person.service');

module.exports = function setupKinshipService(models) {

  const kinshipModel = models.kinshipModel;
  const validationService = models.validationService;
  let baseService = new setupBaseService();

  async function create(kinshipData) {
   
  
    try{
      let dbService = await setupDBService();
      const personId = request.body.personId
      const relativeId = request.body.relativeId
      const kinshipType = request.body.kinshipType
      const validationResult = await validationService.validateKinshipCreation(personId, relativeId, kinshipType);

      if (validationResult) {
        await kinshipModel.create(kinshipData);
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message = '' + err;
        baseService.returnData.data = [];
      }
        
    }catch (err) {
        console.log('Error: ', err);
        baseService.returnData.responseCode = 500;
        baseService.returnData.message = '' + err;
        baseService.returnData.data = [];
      }
  
  
    baseService.returnData.responseCode = 200;
    baseService.returnData.message = 'Getting data successfully';
    baseService.returnData.data = {};

    return baseService.returnData;
  }
 
  async function doList() {
    try {
      const kinships = await kinshipModel.findAll();

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
        where:{
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
