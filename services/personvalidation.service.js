'use strict';
module.exports = function personValidationSetup(){
    function checkNameFormat(data) {
    let errors = [];
    if (data.name) {
        if (!validateNames(data.name)) {
          errors.push('Some characters in the Name field are not allowed.');
        }
      }
  
      if (data.lastName) {
        if (!validateNames(data.lastName)) {
          errors.push('Some characters in the Last Name field are not allowed.');
        }
      }
  
      return errors;
    }

  function validateNames(param){
    if (!/^[a-zA-ZñÑ'\s]{1,25}$/.test(param)) {
      return false
  }
  return true
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
    if (!/^([a-zA-Z0-9]){1,12}$/.test(param)){
      return false
    }
    return true
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
    const minDate = '1900/01/01';
    if (data.birthdate) {
      if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(data.birthdate)) {
        errors.push('Invalid Birth Date field format.');
      } else {
        if (new Date(data.birthdate) - new Date(minDate) < 0 || Date.now() - new Date(data.birthdate) < 0) {
          errors.push('Invalid Birth Date field value.');
        }
      }
    }

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

  function checkContactData(dataTypeField, contactValue) {
    let errors = [];
    if (dataTypeField && contactValue) {
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
    }
    console.log(errors);
    return errors;
  }

  function isInValidPassport(documentTypeId, document) {
    return documentTypeId == 2 && document.length > 12;
  }

  function isNoForeignValidCard(documentTypeId, document) {
    return documentTypeId == 3 && document.length > 12;
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