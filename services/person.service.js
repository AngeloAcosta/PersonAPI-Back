'use strict';
 
const setupBaseService = require('./base.service');
const yup = require('yup');

module.exports = function setupPersonService(dbInstance) {

  let baseService = new setupBaseService();
  const personModel = dbInstance.personModel;
  const person = require('./../models/person'); //Get model person
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
  
  async function create(request) {
    //
    const newUser = new person({
      name: request.body.Name,
      lastname: request.body.LastName,
      birthdate: request.body.DateOfBirth,
      documentTypeId: request.body.DocumentType,
      document: request.body.DocumentID,
      genderId: request.body.Gender,
      countryId: request.body.Nationality, //VERIFIY
      contact1: request.body.contact1,
      contactTypeId1: request.body.contactTypeId1, //VERIFY
      contact2: request.body.contact2,
      contactTypeId2: request.body.contactTypeId2 //VERIFY
    });

    newUser.save(err => {
      if(err){
        next(err);
        console.log('The person wasn´t registered');
      }
      console.log('The person was registered');
    });

    baseService.returnData.responseCode = 200;
    baseService.returnData.message = 'Data was registered satisfactory';
    baseService.returnData.data = {};  
      
    return baseService.returnData; 
  }

  async function findById(id) {
    try {
      const person = await model.findOne({
        where:{
          id
        }
      });

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = person;
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
    create,
    findById
  };
};

//Validations 
  async function createPersonValidation(person) { 
    const schema = yup.object().shape({
      name: yup.string().min(1).matches(/^[A-ZÑa-zñ.\s_-]+$/).required(),
      lastname: yup.string().min(2).matches(/^[A-ZÑa-zñ'.\s_-]+$/).required(),
      birthdate: yup.date().required(),
      documentTypeId: yup.number().required(), //VERIFY
      genderId: yup.number().require(),
      countryId: yup.number().required(),
      contact1: yup.number(), //phone
      contact2: yup.string() //email
    })

    const documentType = documentTypeModel.findOne({ where: {id : person.documentTypeId} });
    const document = documentModel;

    //Validations for DocumentType
    if (documentType) {
      // document type exists
      if (documentType.name === 'DNI' && document.length != 8) { //Es un DNI
        throw new Error('DNI invalid');
      } else if (documentType.name === 'Passport' && document.length != 12) { // Es un pasaporte
        throw new Error('Passport invalid');
      } else if (documentType.name === 'Foreign Card' && document.length != 12){
        throw new Error('Foreign Card invalid');
      }
    } else {
      // document type NO exists
      throw new Error('Type of document invalid');
    }

  }

  module.exports = {createPersonValidation};
