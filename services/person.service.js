'use strict';
 
const setupBaseService = require('./base.service');
const yup = require('yup');

module.exports = function setupPersonService(dbInstance) {

  let baseService = new setupBaseService();
  const personModel = dbInstance.personModel;
  const documentTypeModel = dbInstance.documentTypeModel;

  async function doList() {
    try {
      const people = await personModel.findAll();

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = people;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }
  
  async function create(userData) {
      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = {};  
      
    return baseService.returnData; 
  }

  return {
    doList,
    create
  };
};

//Validations 
  async function createPersonValidation(person) { //Recibe toda la información
    const schema = yup.object().shape({
      name: yup.string().min(1).matches(/^[A-ZÑa-zñ.\s_-]+$/).required(),
      lastname: yup.string().min(2).matches(/^[A-ZÑa-zñ'.\s_-]+$/).required(),
      birthdate: yup.date().required(),
      documentTypeId: yup.number().required(),
      genderId: yup.number(),require(),
      
      
    })

    const documentType = documentTypeModel.findOne({ where: {id : person.documentTypeId} });
    const document = documentModel;

    if (documentType) {
      // document type existe
      if (documentType.name === 'DNI' && document.length != 8) { // Es un DNI
        throw new Error('DNI must have 8 characters');
      } else if (documentType.name === 'Passport' && document.length != 12) { // Es un pasaporte
        throw new Error('Passport must have 12 characters');
      } else if (documentType.name === 'Foreign Card' && document.length != 12){
        throw new Error('Foreign Card must have 12 characters');
      }
    } else {
      // document type NO existe
      throw new Error('Type of document invalid');
    }

    
  }

  module.exports = {createPersonValidation};


