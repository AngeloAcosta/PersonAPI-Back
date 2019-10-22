'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const personValidation = require('./personvalidation.service.js');

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
        contact2: person.contact2,
      };
    });
  }

  function getOrderField(orderBy) {
    let qOrderBy = ['name'];
    if (orderBy === 2) {
      qOrderBy = ['document']
    } else if (orderBy=== 3) {
      qOrderBy =['documentType','name']
    } else if (orderBy === 4) {
      qOrderBy =['country','name']
    }
    return qOrderBy;
  }

  function getOrderType(orderType) {
    let qOrderType = "ASC";
    if (orderType === 2) {
        qOrderType = 'DESC';
    }
    else if (orderType === 1){
      qOrderType = 'ASC';
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
      baseService.returnData.data = peopleData;
    } catch (err) {
      console.log('Error: ', err);
      baseService.responseData(500, err, {})
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
          baseService.responseData(400, "Errors from data validation", errors)
        } else {
          const personModified = await personModel.update(request.body, {
            where
          });
          baseService.responseData(200, "Update completed successfully", personModified)
        }
      } else {
        baseService.responseData(400, "Person doesnt exist on the database", errors)
      }
    } catch (err) {
      console.log('Error: ', err);
      baseService.responseData(500, err, [])
    }

    return baseService.returnData;
  }


  async function create(request) {
    try {
       const newUser = {
        name: request.body.name,
        lastName: request.body.lastName,
        birthdate: request.body.birthdate, //Format: YYYY-MM-DD
        documentTypeId: request.body.documentTypeId,
        document: request.body.document,
        genderId: request.body.genderId,
        countryId: request.body.countryId,
        contact1: request.body.contact1,
        contactType1Id: request.body.contactType1Id,
        contact2: request.body.contact2,
        contactType2Id: request.body.contactType2Id,
        isGhost: false
      };

      let errors = [];
      errors = errors.concat(personValidator.checkBlankSpacesfor(request.body));
  
      errors = errors.concat(personValidator.checkDocument(request.body));
  
      errors = errors.concat(personValidator.checkBirthData(request.body));

      errors = errors.concat(personValidator.checkNameFormat(request.body));
        
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
          
        if (errors.length) {
          baseService.responseData(400, "Errors from data validation", errors)
        } else {
          let created = await personModel.create(newUser); //Create user
          if (created){
            console.log('The person was registered');
            baseService.responseData(200, "Data was registered satisfactory");
          }
          
        } 
      
      
     
    } catch (err) {
      console.log('The person wasn\'t registered ' + err);
      baseService.responseData(500, "The person wasn\'t registered");
    }
    return baseService.returnData; 
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
        contact2: person.contact2,
      }
      
      baseService.responseData(200, "Getting data successfully", peopleData)
    } catch (err) {
      console.log('Error: ', err);
      baseService.responseData(500, err, [])
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