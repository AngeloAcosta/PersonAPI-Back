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
  //#endregion

  async function doList(requestQuery) {
    try {
      let qOrderBy = getOrderField(requestQuery.orderBy);
      let qOrderType = getOrderType(requestQuery.orderType);
      let qQuery = `%${requestQuery.query}%`;
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
        order: [[qOrderBy, qOrderType]],
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

  function checkBlankSpacesforUpdate(data) {
    let errors = [];
    for (let prop in data) {
      if (
        data[prop] === '' &&
        prop !== 'contact1' &&
        prop !== 'contact2' &&
        prop !== 'contactType1Id' &&
        prop !== 'contactType2Id'
      ) {
        errors.push(`The field ${prop} is required.`);
      }
    }
    return errors;
  }

  function checkNameFormatUpdate(data) {
    let errors = [];
    if (!/^[a-zA-ZñÑ'\s]{1,25}$/.test(data.name)) {
      errors.push('Some characters in the Name field are not allowed.');
    }

    if (!/[a-zA-ZñÑ'\s]{1,25}/.test(data.lastName)) {
      errors.push('Some characters in the Last Name field are not allowed.');
    }
    return errors;
  }

  function checkDocumentUpdate(data) {
    let errors = [];
    if (!/^([0-9]){0,1}$/.test(data.documentTypeId)) {
      errors.push('Invalid submitted Document Type value.');
    } else {
      switch (data.documentTypeId) {
        case '1':
          if (!/^[0-9]{1,8}$/.test(data.document)) {
            errors.push('Invalid submitted DNI format.');
          }
          break;

        case '2':
          if (!/^([a-zA-Z0-9]){1,12}$/.test(data.document)) {
            errors.push('Invalid submitted PASSPORT format.');
          }
          break;

        case '3':
          if (!/^([a-zA-Z0-9]){1,12}$/.test(data.document)) {
            errors.push('Invalid submitted CE format.');
          }
          break;

        default:
          break;
      }
    }
    return errors;
  }

  function checkBirthDataUpdate(data) {
    let errors = [];
    const minDate = '1900/01/01';

    if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(data.birthdate)) {
      errors.push('Invalid Birth Date field format.');
    } else {
      if (new Date(data.birthdate) - new Date(minDate) < 0 || Date.now() - new Date(data.birthdate) < 0) {
        errors.push('Invalid Birth Date field value.');
      }
    }

    if (!/^[0-9]{0,1}$/.test(data.genderId)) {
      errors.push('Invalid submitted GenderId value.');
    }

    if (!/^[0-9]{0,2}$/.test(data.countryId)) {
      errors.push('Invalid submitted CountryId value.');
    }
    return errors;
  }

  function checkContactDataUpdate(dataTypeField, contactValue) {
    let errors = [];
    // TODO: Technical Debt | Move validations into a service and create constants
    if (dataTypeField != '' && contactValue != '') {
      // If the dataTypeField is blank
      if (!/^[0-9]{0,1}$/.test(dataTypeField)) {
        errors.push('Contact Type field is invalid.');
      } else {
        //Validation to Contact1
        if (dataTypeField == 1) {
          //Telephone
          if (!/^([0-9]){6,9}$/.test(contactValue)) {
            errors.push('Invalid Telephone format.');
          }
        } else if (dataTypeField == 2) {
          //Email
          if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(contactValue)) {
            errors.push('Invalid Email format.');
          }
        } else {
          errors.push('Contact Type field is invalid.'); //When is submitted other values like 3, 4 and so
        }
      }
    }

    return errors;
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

        errors = errors.concat(checkBlankSpacesforUpdate(request.body));

        errors = errors.concat(checkNameFormatUpdate(request.body));

        errors = errors.concat(checkDocumentUpdate(request.body));

        errors = errors.concat(checkBirthDataUpdate(request.body));

        errors = errors.concat(
          checkContactDataUpdate(
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
          checkContactDataUpdate(
            request.body.contactType2Id,
            request.body.contact2
          )
        );

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

  function isInValidPassport(documentTypeId, document) {
    return documentTypeId == 2 && document.length > 12;
  }

  function isNoForeignValidCard(documentTypeId, document) {
    return documentTypeId == 3 && document.length > 12;
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

      // TODO: Technical Debt: Move this validations into one specific service
      //Validations for DocumentType
      if (documentTypeId) {
        // document type exists
        if (documentTypeId == 1 && document.length != 8) {
          //DNI
          throw new Error('DNI invalid');
        } else if (isInValidPassport(documentTypeId, document)) {
          // Passport
          throw new Error('Passport invalid');
        } else if (isNoForeignValidCard(documentTypeId, document)) {
          //Foreign Card
          throw new Error('Foreign Card invalid');
        }
      } else {
        // document type NO exists
        throw new Error('Type of document invalid');
      }

      //Validations for Contact
      if (contactType1Id) {
        if (contactType1Id == 1) {
          //phone
          if (regExphone.test(contact1) == false) {
            throw new Error('Only numbers');
          }
        }
      } else if (contactType2Id) {
        if (contactType2Id == 1) {
          //phone
          if (regExphone.test(contact2) == false) {
            throw new Error('Only numbers');
          }
        }
      }

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
      if (created) {
        console.log('The person was registered');
        baseService.returnData.responseCode = 200;
        baseService.returnData.message = 'Data was registered satisfactory';
      }
      return baseService.returnData;
    } catch (err) {
      console.log('The person wasn\'t registered ' + err);
      baseService.returnData.responseCode = 500; //Validation error
      baseService.returnData.message = 'The person wasn\'t registered';
    }
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
    create,
    modifyPerson,
    findById
  };
};