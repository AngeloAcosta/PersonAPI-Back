'use strict';

module.exports = function setupValidationService() {
  function validateBirthdate(birthdate, errors) {
    if (!birthdate) {
      errors.push('The birthdate field is required');
      return;
    }

    const parsedBirthdate = new Date(birthdate);
    const minDate = new Date('1900/01/01');
    const maxDate = Date.now();

    if (isNaN(parsedBirthdate)) {
      errors.push('Invalid birthdate format');
    } else if (parsedBirthdate < minDate || parsedBirthdate > maxDate) {
      errors.push('Invalid submitted birthdate');
    }
  }

  function validateContact(contactTypeId, contact, errors) {
    // Assuming that the contactTypeId is not null
    if (![1, 2].includes(contactTypeId)) {
      errors.push('Invalid submitted contact type');
    } else if (contactTypeId === 1 && !/^([0-9]){6,9}$/.test(contact)) {
      errors.push('Invalid phone format');
    } else if (contactTypeId === 2 && !/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(contact)) {
      errors.push('Invalid email format');
    }
  }

  function validateCountry(countryId, errors) {
    if (!countryId) {
      errors.push('The country field is required');
    } else if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(countryId)) {
      errors.push('Invalid submitted country');
    }
  }

  function validateDocument(documentTypeId, document, errors) {
    if (!documentTypeId) {
      errors.push('The document field is required');
    } else if (![1, 2, 3].includes(documentTypeId)) {
      errors.push('Invalid submitted document type');
    } else if (documentTypeId === 1 && !/^[0-9]{1,8}$/.test(document)) {
      errors.push('Invalid DNI format');
    } else if (documentTypeId === 2 && !/^([a-zA-Z0-9]){1,12}$/.test(document)) {
      errors.push('Invalid passport format');
    } else if (documentTypeId === 3 && !/^([a-zA-Z0-9]){1,12}$/.test(document)) {
      errors.push('Invalid foreign card format');
    }
  }

  function validateGender(genderId, errors) {
    if (!genderId) {
      errors.push('The gender field is required');
    } else if (![1, 2].includes(genderId)) {
      errors.push('Invalid submitted gender');
    }
  }

  function validateLastName(lastName, errors) {
    if (!lastName) {
      errors.push('The last name field is required');
    } else if (!/^[a-zA-ZñÑ'\s]{1,25}$/.test(lastName)) {
      errors.push('Invalid last name format');
    }
  }

  function validateName(name, errors) {
    if (!name) {
      errors.push('The name field is required');
    } else if (!/^[a-zA-ZñÑ'\s]{1,25}$/.test(name)) {
      errors.push('Invalid name format');
    }
  }

  return {
    validateBirthdate,
    validateContact,
    validateCountry,
    validateDocument,
    validateGender,
    validateLastName,
    validateName
  };
}
