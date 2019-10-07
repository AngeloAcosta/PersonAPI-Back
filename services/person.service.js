'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupPersonService(model) {
  let baseService = new setupBaseService();

  async function doList() {
    try {
      const people = await model.findAll();

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

  function checkBlankSpacesforUpdate(data) {
    let errors = [];
    for (let prop in data) {
      if (data[prop] === '' && prop !== 'Contact' && prop !== 'ContactType') {
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
          if (!/^[0-9]{8}$/.test(data.document)) {
            errors.push('Invalid submitted DNI format.');
          }
          break;

        case '2':
          if (!/^([a-zA-Z0-9]){12}$/.test(data.document)) {
            errors.push('Invalid submitted PASSPORT format.');
          }
          break;

        case '3':
          if (!/^([a-zA-Z0-9]){12}$/.test(data.document)) {
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

    if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(data.birthdate)) {
      errors.push('Invalid Birth Date field format.');
    }

    if (!/^[0-9]{0,1}$/.test(data.genderId)) {
      errors.push('Invalid submitted GenderId value.');
    }

    if (!/^[0-9]{0,2}$/.test(data.countryId)) {
      errors.push('Invalid submitted CountryId value.');
    }
    return errors;
  }

  function checkContactDataUpdate(dataTypeField, ContactValue) {
    let errors = [];

    if (!/^[0-9]{0,1}$/.test(dataTypeField)) {
      errors.push('Contact Type field is invalid.');
    } else {
      //Validation to Contact1
      if (dataTypeField == 1) {
        //Telephone
        if (!/^([0-9]){6,9}$/.test(request.body.contact1)) {
          errors.push('Invalid Telephone format.');
        }
      } else if (dataTypeField == 2) {
        //Email
        if (
          !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.test(
            ContactValue
          )
        ) {
          errors.push('Invalid Email format.');
        }
      } else {
        errors.push('Contact Type field is invalid.'); //When is submitted other values like 3, 4 and so
      }
    }

    return errors;
  }

  async function modifyPerson(request) {
    let errors = [];
    try {
      //Check if person exists
      const where = { id: request.params.id };
      const person = await model.findOne({ where });

      if (person) {
        //Proper data validation for each field to modify

        errors.concat(checkBlankSpacesforUpdate(request.body));

        errors.concat(checkNameFormatUpdate(request.body));

        errors.concat(checkDocumentUpdate(request.body));

        errors.concat(checkBirthDataUpdate(request.body));

        errors.concat(
          checkContactDataUpdate(
            request.body.contactTypeId1,
            request.body.contact1
          )
        );

        errors.concat(
          checkContactDataUpdate(
            request.body.contactTypeId2,
            request.body.contact2
          )
        );

        //Send Validation Errors or Update the data

        if (errors.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = 'Errors from data validation';
          baseService.returnData.data = errors;
        } else {
          const personModified = await model.update(request.body, {
            where
          });

          if (personModified) {
            baseService.returnData.responseCode = 200;
            baseService.returnData.message = 'Update completed successfully.';
            baseService.returnData.data = [];
          }
        }
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message =
          "Person doesn't exist on the database.";
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

  async function findById(id) {
    try {
      const person = await model.findOne({
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
    modifyPerson,
    findById
  };
};
