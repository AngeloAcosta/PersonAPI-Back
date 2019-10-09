'use strict';

const setupBaseService = require('./base.service');
const setupPersonService = require('./person.service');

module.exports = function setupKinshipService(model) {

  let baseService = new setupBaseService();

  async function create(kinshipData) {
    let errors =[];
    try{
        if(kinshipData){
            errors.concat(checkkinshipSpouse(request.body));
        }
    }catch (err) {
        console.log('Error: ', err);
        baseService.returnData.responseCode = 500;
        baseService.returnData.message = '' + err;
        baseService.returnData.data = [];
      }
  
    
    
    const kinship = await model.create(kinshipData);
    
    baseService.returnData.responseCode = 200;
    baseService.returnData.message = 'Getting data successfully';
    baseService.returnData.data = {};

    return baseService.returnData;
  }
  function checkkinshipSpouse() {
    let errors = [];
    const personId = personModel.findOne({
        where:{
            id: request.body.id
        }
    });
    const relativeId=personModel.findOne({
        where:{
            id : request.body.id
        }
    })
   
    if (personId.genderId=='1'&& relativeId.genderId=='1') {
      errors.push('This relationship is not allowed .');
    }

    if (personId.genderId=='2'&& relativeId.genderId=='2') {
      errors.push('This relationship is not allowed .');
    }
    return errors;
  }


  async function doList() {
    try {
      const kinships = await model.findAll();

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
        
      const kinship = await model.findOne({
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
