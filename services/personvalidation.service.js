'use strict';

module.exports = function personValidationSetup(){
    function checkNameFormat(data) {
    let errors = [];
    if (data.name && !validateNames(data.name)) {
        errors.push('Some characters in the Name field are not allowed.');
    }   
    if (data.lastName && !validateNames(data.lastName)) {
      errors.push('Some characters in the Last Name field are not allowed.');
    }    
    return errors;
    }
  
  function validateNames(param){
      return /^[a-zA-ZñÑ'\s]{1,25}$/.test(param) 
  }
  function checkDocument(data) {
    let errors = [];
    if (data.documentTypeId) {
      // IF DOCUMENT TYPE HAVE MORE THAN ONE DIGIT
      if (!/^([0-9]){0,1}$/.test(data.documentTypeId)) {
        errors.push('Invalid submitted Document Type value.');
      } else {
        validateDocument(data.documentTypeId, data.document, errors)
    }
    return errors;
    }
  } 

  function validateForeignDocument(param){
    return /^([a-zA-Z0-9]){1,12}$/.test(param)
  }

  function validateDocument(doctype, userDoc, errors){
    switch (doctype) {
      case 1:
        // TEST DNI FORMAT
        if (!/^[0-9]{1,8}$/.test(userDoc)) {
          errors.push(`Invalid submitted DNI format.`);
        }
        break;
      case 2:
        // TEST PASSPORT FORMAT
        if (!validateForeignDocument(userDoc)) {
          errors.push('Invalid submitted PASSPORT format.');
        }
        break;
      case 3:
        // TEST CE FORMAT
        if (!validateForeignDocument(userDoc)) {
          errors.push('Invalid submitted CE format.');
        }
        break;
        default: 
        break;
    }

  }

  function checkBirthData(data) {
    let errors = [];
    let errMsg = checkBirthday(data.birthdate)
    if (errMsg) {
      errors.push(errMsg)
    }

    if (data.genderId && !checkGender(data.genderId)) {
      errors.push('Invalid submitted GenderId value.');
    }

    if (data.countryId && !checkCountry(data.countryId)) {
      errors.push('Invalid submitted CountryId value.');
    }
    return errors;
  }

  function checkGender(gender) {
    return /^[0-9]{0,1}$/.test(gender);
  }
  
  function checkCountry(country) {
    return /^[0-9]{0,2}$/.test(country)
  }

  function checkBirthday(date) {
    const minDate ='1900/01/01';
    const invalidDate = new Date(date) - new Date(minDate) < 0 || Date.now() - new Date(date) < 0;
    // if not in format YYYY-MM-DD
    if (date && !/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(date)) {
      return 'Invalid Birth Date field format.';
    } else if (invalidDate) {
      return 'Invalid Birth Date field value.';
    } else {
      return;
    }
  }
  

  function checkContactData(dataTypeField, contactValue) {
    let errors = [];
    let errMsg = validateContact(dataTypeField,contactValue)
    if (dataTypeField && contactValue && errMsg) {
      //Validation to Contacts
      errors.push(errMsg)
    } else if (!dataTypeField && contactValue) {
      errors.push("No type of contact selected")
    }
    return errors;
  }

  function validateContact(dataTypef, contact){
     //Telephone
     const regexEmail = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
     const regexPhone = /^([0-9]){6,9}$/;

    if (dataTypef === 1 && !regexPhone.test(contact)) {
      return 'Invalid Telephone format.';
    } else if (dataTypef === 2 && !regexEmail.test(contact)) {
      return 'Invalid Email format.';
    } else if (dataTypef >= 3 || dataTypef <= 0) {
      return 'Contact Type field is invalid.'; //When is submitted other values like 3, 4 and so
    } else return;
  }
  function isInValidPassport(documentTypeId, document) {
    return documentTypeId === 2 && document.length > 12;
  }

  function isNoForeignValidCard(documentTypeId, document) {
    return documentTypeId === 3 && document.length > 12;
  }

  function checkBlankSpacesfor(data) {
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

   return {
    checkBlankSpacesfor,
    isNoForeignValidCard,
    isInValidPassport,
    checkContactData,
    checkNameFormat,
    checkBirthData,
    checkDocument
    }
   }
  