'use strict';

module.exports = function personValidationSetup(){
    function checkNameFormat(data) {
    let errors = [];
    if (data.name) {
        if (!validateNames(data.name)) {
          errors.push('Some characters in the Name field are not allowed.');
        }
      } else {
          errors.push("Name can't be null")
      }
  
      if (data.lastName) {
        if (!validateNames(data.lastName)) {
          errors.push('Some characters in the Last Name field are not allowed.');
        } else {
          errors.push("Last name can't be null")
        }
    
        return errors;
      }
    }
  function validateNames(param){
      return /^[a-zA-ZñÑ'\s]{1,25}$/.test(param) 
}
  function checkDocument(data) {
    let errors = [];
    if (data.documentTypeId) {
      if (!/^([0-9]){0,1}$/.test(data.documentTypeId)) {
        errors.push('Invalid submitted Document Type value.');
      } else {
        validateDocument(data.documentTypeId,data.document,errors)
    }
    return errors;
  }
}

  function validateForeignDocument(param){
    return /^([a-zA-Z0-9]){1,12}$/.test(param)
  }

  function validateDocument(doctype,document,err){
    switch (doctype) {
      case '1':
        if (!/^[0-9]{1,8}$/.test(document)) {
          err.push(`Invalid submitted DNI format.`);
        }
        break;
      case '2':
        if (!validateForeignDocument(document)) {
          err.push('Invalid submitted PASSPORT format.');
        }
        break;
      case '3':
        if (!validateForeignDocument(document)) {
          err.push('Invalid submitted CE format.');
        }
        break;
      default:
        break;
    }

  }

  function checkBirthData(data) {
    let errors = [];
    checkBirthday(data.birthdate,errors)

    if (data.genderId) {
      if (!/^[0-9]{0,1}$/.test(data.genderId)) {
        errors.push('Invalid submitted GenderId value.');
      }
    }

    if (data.countryId) {
      if (!/^[0-9]{0,2}$/.test(data.countryId)) {
        errors.push('Invalid submitted CountryId value.');
      }
    }

    return errors;
  }

  function checkBirthday(param,err){
    const minDate='1900/01/01';
    if (param) {
      if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(param)) {
        err.push('Invalid Birth Date field format.');
      } else {
        if (new Date(param) - new Date(minDate) < 0 || Date.now() - new Date(param) < 0) {
          err.push('Invalid Birth Date field value.');
        }
      }
  }
}
  function checkContactData(dataTypeField, contactValue) {
    let errors = [];
    if (dataTypeField && contactValue) {
      if(!dataTypeField && !contactValue) {
        // If the dataTypeField is blank
        if (!/^[0-9]{0,1}$/.test(dataTypeField)) {
          errors.push('Contact Type field is invalid.');
        } else {
          //Validation to Contact1
          validateContact(dataTypeField,contactValue,errors)
        }
      }
    }
    console.log(errors);
    return errors;
  }

  function validateContact(dataTypef,contact,err){
    if (dataTypef === 1) {
      //Telephone
      if (!/^([0-9]){6,9}$/.test(contact)) {
        err.push('Invalid Telephone format.');
      }
    } else if (dataTypef === 2) {
      //Email
      if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(contact)) {
        err.push('Invalid Email format.');
      }
    } else {
      err.push('Contact Type field is invalid.'); //When is submitted other values like 3, 4 and so
    }
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
  