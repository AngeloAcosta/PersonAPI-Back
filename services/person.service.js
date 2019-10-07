'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');

const Op = Sequelize.Op;

module.exports = function setupPersonService(dbInstance) {

  const contactTypeModel = dbInstance.contactTypeModel;
  const countryModel = dbInstance.countryModel;
  const documentTypeModel = dbInstance.documentTypeModel;
  const genderModel = dbInstance.genderModel;
  const personModel = dbInstance.personModel;
  let baseService = new setupBaseService();

  async function doList(limit, offset, query, orderBy, orderType) {
    try {
      // Get the order field
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
      // Get the order type
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
      // Get the query
      let qQuery = `%${query}%`;
      // Execute the query
      let people = await personModel.findAll({
        include: [
          {
            as: 'documentType',
            model: documentTypeModel
          },
          {
            as: 'gender',
            model: genderModel
          },
          {
            as: 'country',
            model: countryModel
          },
          {
            as: 'contactType1',
            model: contactTypeModel
          },
          {
            as: 'contactType2',
            model: contactTypeModel
          }
        ],
        limit,
        offset,
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
      people = people.map(person => {
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
