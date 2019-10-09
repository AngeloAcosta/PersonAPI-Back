'use strict';
 
const setupBaseService = require('./base.service');

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
  
  async function create(request) {
    try {
    const documentTypes = documentTypeModel.findOne({ where: {id : request.body.DocumentTypes} });
    const document = request.body.DocumentID;

    //Validations for DocumentType
      if (documentTypes) {
        // document type exists
        if (documentTypes.name === 'DNI' && document.length != 8) { //DNI
          throw new Error('DNI invalid');
        } else if (documentTypes.name === 'Passport' && document.length != 12) { // Passport
          throw new Error('Passport invalid');
        } else if (documentTypes.name === 'Foreign Card' && document.length != 12){ //Foreign Card
          throw new Error('Foreign Card invalid');
        }
      } else {
        // document type NO exists
        throw new Error('Type of document invalid');
      }

    
      const newUser = {
                  name: request.body.Name,
                  lastName: request.body.LastName,
                  birthdate: request.body.DateOfBirth, //Format: YYYY-MM-DD
                  documentTypeId: request.body.DocumentType,
                  document: request.body.DocumentID,
                  genderId: request.body.Gender,
                  countryId: request.body.Country, 
                  contact1: request.body.contact1,
                  contactTypeId1: request.body.contactTypeId1, 
                  contact2: request.body.contact2,
                  contactTypeId2: request.body.contactTypeId2 
                };

        let created = await personModel.create(newUser); //Create user
        if (created){
          console.log('The person was registered');
          baseService.returnData.responseCode = 200;
          baseService.returnData.message = 'Data was registered satisfactory';
        }
        return baseService.returnData;
    } catch (err) {
      console.log('The person wasn´t registered');
      baseService.returnData.responseCode = 500;
    }
     
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
