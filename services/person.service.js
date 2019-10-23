'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const Op = Sequelize.Op;

module.exports = function setupPersonService(dependencies) {
  let baseService = new setupBaseService();
  const contactTypeModel = dependencies.contactTypeModel;
  const countryModel = dependencies.countryModel;
  const documentTypeModel = dependencies.documentTypeModel;
  const genderModel = dependencies.genderModel;
  const personModel = dependencies.personModel;
  const validationService = dependencies.validationService;
  //#region Helpers
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

  function getSimplePersonModel(model) {
    return {
      id: model.id,
      birthdate: model.birthdate,
      contact1: model.contact1,
      contactType1: model.contactType1 && model.contactType1.name,
      contactType1Id: model.contactType1 && model.contactType1.id,
      contact2: model.contact2,
      contactType2: model.contactType2 && model.contactType2.name,
      contactType2Id: model.contactType2 && model.contactType2.id,
      country: model.country.name,
      countryId: model.country.id,
      document: model.document,
      documentType: model.documentType.name,
      documentTypeId: model.documentType.id,
      gender: model.gender.name,
      genderId: model.gender.id,
      lastName: model.lastName,
      name: model.name
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
      // Return the data
      return baseService.getServiceResponse(200, "Success", people.map(p => getSimplePersonModel(p)));
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function modify(id, person) {
    try {
      // Check if person exists
      const personExists = await personModel.findOne({ where: { id } });
      if (!personExists || personExists.isGhost) {
        return baseService.getServiceResponse(404, 'Not found', {});
      }
      // Check if document exists
      const documentExists = await personModel.findOne({ where: { document: person.document } });
      if (documentExists && documentExists.id !== id) {
        return baseService.getServiceResponse(400, 'Document field must be unique', {});
      }
      // Validate errors
      const errors = [];
      if (person.birthdate) {
        validationService.validateBirthdate(person.birthdate, errors);  
      }
      if (person.contactType1Id) {
        validationService.validateContact(person.contactType1Id, person.contact1, errors);
      }
      if (person.contactType2Id) {
        validationService.validateContact(person.contactType2Id, person.contact2, errors);
      }
      if (person.countryId) {
        validationService.validateCountry(person.countryId, errors);
      }
      if (person.documentTypeId) {
        validationService.validateDocument(person.documentTypeId, person.document, errors);
      }
      if (person.lastName) {
        validationService.validateLastName(person.lastName, errors);
      }
      if (person.name) {
        validationService.validateName(person.name, errors);
      }      
      if (errors.length > 0) {
        // If some errors were found, return 400
        return baseService.getServiceResponse(400, errors.join('\n'), {})
      } else {
        // Else, create the person
        let modifiedPerson = await personModel.update(person, { where: { id } });
        // Then obtain their complete data (including associations)
        modifiedPerson = await personModel.findOne({
          include: [
            { as: 'documentType', model: documentTypeModel },
            { as: 'gender', model: genderModel },
            { as: 'country', model: countryModel },
            { as: 'contactType1', model: contactTypeModel },
            { as: 'contactType2', model: contactTypeModel }
          ],
          where: { id }
        });
        // And return 200
        return baseService.getServiceResponse(200, "Person modified", getSimplePersonModel(modifiedPerson));
      }

    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function create(person) {
    try {
      // Check if document exists
      const documentExists = await personModel.findOne({ where: { document: person.document } });
      if (documentExists) {
        return baseService.getServiceResponse(400, 'Document field must be unique', {});
      }
      // Validate errors
      const errors = [];
      validationService.validateBirthdate(person.birthdate, errors);
      validationService.validateCountry(person.countryId, errors);
      validationService.validateDocument(person.documentTypeId, person.document, errors);
      validationService.validateGender(person.genderId, errors);
      validationService.validateLastName(person.lastName, errors);
      validationService.validateName(person.name, errors);
      if (person.contactType1Id) {
        validationService.validateContact(person.contactType1Id, person.contact1, errors);
      }
      if (person.contactType2Id) {
        validationService.validateContact(person.contactType2Id, person.contact2, errors);
      }
      if (errors.length > 0) {
        // If some errors were found, return 400
        return baseService.getServiceResponse(400, errors.join('\n'), {})
      } else {
        // Else, create the person
        let createdPerson = await personModel.create(person);
        // Then obtain their complete data (including associations)
        createdPerson = await personModel.findOne({
          include: [
            { as: 'documentType', model: documentTypeModel },
            { as: 'gender', model: genderModel },
            { as: 'country', model: countryModel },
            { as: 'contactType1', model: contactTypeModel },
            { as: 'contactType2', model: contactTypeModel }
          ],
          where: { id: createdPerson.id }
        });
        // And return 200
        return baseService.getServiceResponse(200, "Person created", getSimplePersonModel(createdPerson));
      }
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function findById(id) {
    try {
      // Get models and find person
      const person = await personModel.findOne({
        include: [
          { as: 'documentType', model: documentTypeModel },
          { as: 'gender', model: genderModel },
          { as: 'country', model: countryModel },
          { as: 'contactType1', model: contactTypeModel },
          { as: 'contactType2', model: contactTypeModel }
        ],
        where: { id }
      });
      if (person && !person.isGhost) {
        // If a person was found, return 200
        return baseService.getServiceResponse(200, "Success", getSimplePersonModel(person));
      } else {
        // Else, return 404
        return baseService.getServiceResponse(404, "Not found", {});
      }

    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doList,
    create,
    modify,
    findById
  };
};
