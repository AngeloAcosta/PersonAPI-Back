'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const Op = Sequelize.Op;

module.exports = function setupPersonService(dependencies) {
  const baseService = new setupBaseService();
  const contactTypeModel = dependencies.contactTypeModel;
  const countryModel = dependencies.countryModel;
  const documentTypeModel = dependencies.documentTypeModel;
  const genderModel = dependencies.genderModel;
  const personModel = dependencies.personModel;
  const validationService = dependencies.validationService;

  //#region Helpers
  function getDoListModel(model) {
    return model.map(person => {
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

  async function getInspectModel(model) {
    const genders = (await genderModel.findAll()).map(g => ({ id: g.id, name: g.name }));
    const countries = (await countryModel.findAll()).map(c => ({ id: c.id, name: c.name }));
    const documentTypes = (await documentTypeModel.findAll()).map(dT => ({ id: dT.id, name: dT.name }));
    const contactTypes = (await contactTypeModel.findAll()).map(cT => ({ id: cT.id, name: cT.name }));
    const person = {
      id: model.id,
      name: model.name,
      lastName: model.lastName,
      birthdate: model.birthdate,
      contactType1Id: model.contactType1 && model.contactType1.id,
      contactType1: model.contactType1 && model.contactType1.name,
      contact1: model.contact1,
      contactType2Id: model.contactType2 && model.contactType2.id,
      contactType2: model.contactType2 && model.contactType2.name,
      contact2: model.contact1,
      countryId: model.country.id,
      country: model.country.name,
      documentTypeId: model.documentType.id,
      documentType: model.documentType.name,
      document: model.document,
      genderId: model.gender.id,
      gender: model.gender.name
    };
    return {
      genders,
      countries,
      documentTypes,
      contactTypes,
      person
    };
  }

  function getOrderField(orderBy) {
    let qOrderBy = ['name'];
    if (orderBy === 2) {
      qOrderBy = ['document']
    } else if (orderBy === 3) {
      qOrderBy = ['documentType', 'name']
    } else if (orderBy === 4) {
      qOrderBy = ['country', 'name']
    }
    return qOrderBy;
  }

  function getOrderType(orderType) {
    let qOrderType = "ASC";
    if (orderType === 2) {
      qOrderType = 'DESC';
    }
    else if (orderType === 1) {
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
      // Return the data
      return baseService.getServiceResponse(200, "Success", getDoListModel(people))
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {})
    }
  }

  async function modify(id, person) {
    try {
      // Check if person exists
      const personExists = await personModel.findOne({ where: { id } });
      if (!personExists) {
        return baseService.getServiceResponse(404, 'Not found', {});
      }
      // Check if document exists
      const documentExists = await personModel.findOne({ where: { document: person.document } });
      if (documentExists && documentExists.id !== id) {
        return baseService.getServiceResponse(400, 'Document field must be unique', {});
      }
      // Validate errors
      const errors = [];
      validationService.validateBirthdate(person.birthdate, errors);
      validationService.validateCountry(person.countryId, errors);
      validationService.validateDocument(person.documentTypeId, person.document, errors);
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
        return baseService.getServiceResponse(200, "Person modified", await getInspectModel(modifiedPerson));
      }
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {})
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
        return baseService.getServiceResponse(200, "Person created", await getInspectModel(createdPerson));
      }
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {})
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
      if (person) {
        // If a person was found, return 200
        return baseService.getServiceResponse(200, "Success", await getInspectModel(person))
      } else {
        // Else, return 404
        return baseService.getServiceResponse(404, "Not found", {})
      }
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {})
    }
  }

  return {
    doList,
    create,
    modify,
    findById
  };
};