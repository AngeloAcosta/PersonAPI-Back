'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');

const Op = Sequelize.Op;

module.exports = function setupPersonService(models) {

  const contactTypeModel = models.contactTypeModel;
  const countryModel = models.countryModel;
  const documentTypeModel = models.documentTypeModel;
  const genderModel = models.genderModel;
  const personModel = models.personModel;
  let baseService = new setupBaseService();

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
        qOrderBy = 'name';
        break;
      case 2:
        qOrderBy = 'lastName';
        break;
      case 3:
        qOrderBy = 'birthdate';
        break;
      case 4:
        qOrderBy = 'document';
        break;
      case 5:
        qOrderBy = 'genderId';
        break;
      case 6:
        qOrderBy = 'countryId';
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
        qOrderType = 'ASC'
        break;
      case 2:
        qOrderType = 'DESC'
        break;
      default:
        qOrderType = 'ASC'
        break;
    }
    return qOrderType;
  }
  //#endregion

  async function doList(requestQuery) {
    try {
      let qOrderBy = getOrderField(requestQuery.orderBy);
      let qOrderType = getOrderType(requestQuery.orderType);
      let qQuery = `%${requestQuery.query}%`;
      // Execute the query
      let people = await personModel.findAll({
        include: [
          { as: 'documentType', model: documentTypeModel },
          { as: 'gender', model: genderModel },
          { as: 'country', model: countryModel },
          { as: 'contactType1', model: contactTypeModel },
          { as: 'contactType2', model: contactTypeModel }
        ],
        limit: requestQuery.limit,
        offset: requestQuery.offset,
        order: [
          [qOrderBy, qOrderType]
        ],
        where: {
          [Op.or]: [
            { name: { [Op.like]: qQuery } },
            { lastName: { [Op.like]: qQuery } },
            { document: { [Op.like]: qQuery } },
            { contact1: { [Op.like]: qQuery } },
            { contact2: { [Op.like]: qQuery } }
          ]
        }
      });
      // Mold the response
      people = getDoListModel(people);
      // Return the data
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

  async function findById(id) {
    try {
      const person = await personModel.findOne({
        where: {
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
    findById
  };

};
