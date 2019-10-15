'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const personValidation = require('./personvalidation.service');

const Op = Sequelize.Op;

module.exports = function setupPersonService(models) {
  const contactTypeModel = models.contactTypeModel;
  const countryModel = models.countryModel;
  const documentTypeModel = models.documentTypeModel;
  const genderModel = models.genderModel;
  const personModel = models.personModel;
  let baseService = new setupBaseService();
  const personValidator = new personValidation();
  //#region Helpers
  function getDoListModel(people) {
    return people.map(person => {
      let contactType1 = null;
      if (person.contactType1) {
        contactType1 = person.contactType1.name;
      }
      let contactType2 = null;
      if (person.contactType2) {
        contactType2 = person.contactType2.name;
      }
      return {
        id: person.id,
        name: person.name,
        lastName: person.lastName,
        birthdate: person.birthdate,
        documentType: person.documentType.name,
        document: person.document,
        gender: person.gender.name,
        country: person.country.name,
        contactType1,
        contact1: person.contact1,
        contactType2,
        contact2: person.contact2
      };
    });
  }

  function getOrderField(orderBy) {
    let qOrderBy;
    switch (orderBy) {
      case 1:
        qOrderBy = ['name'];
        break;
      case 2:
        qOrderBy = ['document'];
        break;
      case 3:
        qOrderBy = ['documentType', 'name'];
        break;
      case 4:
        qOrderBy = ['country', 'name'];
        break;
      default:
        qOrderBy = 'name';
        break;
    }
    return qOrderBy;
  }

  function getOrderType(orderType) {
    let qOrderType;
    switch (orderType) {
      case 1:
        qOrderType = 'ASC';
        break;
      case 2:
        qOrderType = 'DESC';
        break;
      default:
        qOrderType = 'ASC';
        break;
    }
    return qOrderType;
  }

  function getQueryWhereClause(queries) {
    return {
      [Op.or]: queries.map(q => {
        return { [Op.like]: `%${q}%` };
      })
    };
  }
  //#endregion

  async function doList(requestQuery) {
    try {
      let qOrderBy = getOrderField(requestQuery.orderBy);
      let qOrderType = getOrderType(requestQuery.orderType);
      let qQueryWhereClause = getQueryWhereClause(requestQuery.query.split(' '));
      // Execute the query
      const people = await personModel.findAll({
        include: [
          { as: 'documentType', model: documentTypeModel },
          { as: 'gender', model: genderModel },
          { as: 'country', model: countryModel },
          { as: 'contactType1', model: contactTypeModel },
          { as: 'contactType2', model: contactTypeModel }
        ],
        limit: requestQuery.limit,
        offset: requestQuery.offset,
        order: [[...qOrderBy, qOrderType]],
        where: {
          [Op.or]: [
            { name: qQueryWhereClause },
            { lastName: qQueryWhereClause },
            { document: qQueryWhereClause },
            { contact1: qQueryWhereClause },
            { contact2: qQueryWhereClause }
          ]
        }
      });
      // Mold the response
      const peopleData = getDoListModel(people);
      // Return the data
      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = peopleData;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

 
 
  async function modifyPerson(request) {
    let errors = [];
    try {
      //Check if person exists
      const where = {
        id: request.params.id
      };
      const person = await personModel.findOne({
        where
      });

      if (person) {
        //Proper data validation for each field to modify

        errors = errors.concat(personValidator.checkBlankSpacesfor(request.body));

        errors = errors.concat(personValidator.checkNameFormat(request.body));

        errors = errors.concat(personValidator.checkDocument(request.body));

        errors = errors.concat(personValidator.checkBirthData(request.body));

        errors = errors.concat(
          personValidator.checkContactData(
            request.body.contactType1Id,
            request.body.contact1
          )
        );
        //Set null values if is blank
        if (request.body.contactType1Id == '') {
          request.body.contactType1Id = null;
          request.body.contact1 = null;
        }

        if (request.body.contactType2Id == '') {
          request.body.contactType2Id = null;
          request.body.contact2 = null;
        }

        errors = errors.concat(
          personValidator.checkContactData(
            request.body.contactType2Id,
            request.body.contact2
          )
        );
        console.log(request.body);
        //Send Validation Errors or Update the data

        if (errors.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = 'Errors from data validation';
          baseService.returnData.data = errors;
        } else {
          const personModified = await personModel.update(request.body, {
            where
          });

          baseService.returnData.responseCode = 200;
          baseService.returnData.message = 'Update completed successfully.';
          baseService.returnData.data = personModified;
        }
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message = 'Person doesnt exist on the database.';
        baseService.returnData.data = errors;
      }
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
      const documentTypeId = request.body.documentTypeId;
      const contactType1Id = request.body.contactType1Id;
      const contactType2Id = request.body.contactType2Id;
      const contact1 = request.body.contact1;
      const contact2 = request.body.contact2;
      const document = request.body.document;
      const regExphone = RegExp('^[0-9]+$'); //Validation for phonenumber

     

      const newUser = {
        name: request.body.Name,
        lastName: request.body.lastName,
        birthdate: request.body.birthdate, //Format: YYYY-MM-DD
        documentTypeId: request.body.documentTypeId,
        document: request.body.document,
        genderId: request.body.genderId,
        countryId: request.body.countryId,
        contact1: request.body.contact1,
        contactType1Id: request.body.contactType1Id,
        contact2: request.body.contact2,
        contactType2Id: request.body.contactType2Id
      };

      let created = await personModel.create(newUser); //Create user
      let errors = [];
      if(created) {
        errors = errors.concat(personValidator.checkBlankSpacesfor(request.body));
  
        errors = errors.concat(personValidator.checkDocument(request.body));
  
        errors = errors.concat(personValidator.checkBirthData(request.body));
        
        errors = errors.concat(
          personValidator.checkContactData(
            request.body.contactType1Id,
            request.body.contact1
          )
        );

        errors = errors.concat(
          personValidator.checkContactData(
            request.body.contactType2Id,
            request.body.contact2
          )
        );

       console.log('The person was registered');
        baseService.returnData.responseCode = 200;
        baseService.returnData.message = 'Data was registered satisfactory';
      
      return baseService.returnData;}

    } catch (err) {
      console.log('The person wasn\'t registered ' + err);
      baseService.returnData.responseCode = 500; //Validation error
      baseService.returnData.message = 'The person wasn\'t registered';
    }
   
    
  }

  async function findById(id) {
    try {
      const person = await personModel.findOne({
        include: [
          { as: 'documentType', model: documentTypeModel },
          { as: 'gender', model: genderModel },
          { as: 'country', model: countryModel },
          { as: 'contactType1', model: contactTypeModel },
          { as: 'contactType2', model: contactTypeModel }
        ],
        where: {
          id
        }
        

      }); 
      let contactType1 = null;
      if (person.contactType1) {
        contactType1 = person.contactType1.name;
      }
      let contactType2 = null;
      if (person.contactType2) {
        contactType2 = person.contactType2.name;
      }
      const peopleData = {
        
        id: person.id,
        name: person.name,
        lastName: person.lastName,
        birthdate: person.birthdate,
        documentType: person.documentType.name,
        document: person.document,
        country: person.country.name,
        gender: person.gender.name,
        contactType1,
        contact1: person.contact1,
        contactType2,
        contact2: person.contact2
      }
      
     
      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = peopleData;
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
    modifyPerson,
    findById
  };
};