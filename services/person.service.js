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
      genderId: yup.number().require(),
      countryId: yup.number().required()
    })

    const documentType = documentTypeModel.findOne({ where: {id : person.documentTypeId} });
    const contactType = contactTypeModel.findOne({ where: {id : person.contactTypeId} });
    const document = documentModel;
    const contact = contactModel;

    //Validations of DocumentType
    if (documentType) {
      // document type exists
      if (documentType.name === 'DNI' && document.length != 8) { //Es un DNI
        throw new Error('DNI must have 8 characters');
      } else if (documentType.name === 'Passport' && document.length != 12) { // Es un pasaporte
        throw new Error('Passport must have 12 characters');
      } else if (documentType.name === 'Foreign Card' && document.length != 12){
        throw new Error('Foreign Card must have 12 characters');
      }
    } else {
      // document type NO exists
      throw new Error('Type of document invalid');
    }


    //Validations of ContactTypeId
    let phoneRegExp = new RegExp('^[0-9]+$'); //Allows only numbers
    let emailRegExp = new RegExp('^[a-zñA-ZÑ@.]+$'); //Allows characters for email

    if(contactType){
      //contact type exists
      if (contactType.name == 'phone' &&  phoneRegExp == false){
        throw new Error('Only numbers');
      }
      else if(contactType.name == 'email' && emailRegExp == false){
        throw new Error('Email invalid');

      }
    }


  }

  module.exports = {createPersonValidation};


