'use strict';

const Sequelize = require('sequelize');
const constants = require('./constants');

const Op = Sequelize.Op;

module.exports = function setupSharedService(dependencies) {
  const kinshipModel = dependencies.kinshipModel;
  const personModel = dependencies.personModel;

  //#region Helpers
  async function getCouple(personId) {
    const coupleKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.coupleKinshipType.id }
    });
    return coupleKinship && coupleKinship.relative;
  }

  async function getFather(personId) {
    const fatherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    return fatherKinship && fatherKinship.relative;
  }

  function getKinshipTypeIds() {
    return [
      constants.coupleKinshipType.id,
      constants.fatherKinshipType.id,
      constants.motherKinshipType.id,
      constants.siblingKinshipType.id,
      constants.paternalGrandfatherKinshipType.id,
      constants.paternalGrandmotherKinshipType.id,
      constants.maternalGrandfatherKinshipType.id,
      constants.maternalGrandmotherKinshipType.id
    ];
  }

  async function getMother(personId) {
    const motherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    return motherKinship && motherKinship.relative;
  }

  async function getSiblings(id, fatherId) {
    const siblingKinships = await kinshipModel.findAll({
      include: [{ as: 'person', model: personModel }],
      where: {
        personId: {
          [Op.ne]: id
        },
        relativeId: fatherId,
        kinshipType: constants.fatherKinshipType.id
      }
    });
    return siblingKinships.map(sK => (sK.person));
  }

  function getSimpleKinshipModel(person, relative, kinshipType) {
    return {
      personId: person.id,
      personName: person.name,
      personLastName: person.lastName,
      relativeId: relative.id,
      relativeName: relative.name,
      relativeLastName: relative.lastName,
      kinshipTypeId: kinshipType.id,
      kinshipType: kinshipType.name
    };
  }
  //#endregion

  async function getPersonKinships(person) {
    const kinships = [];
    // Get and attach couple
    const couple = await getCouple(person.id);
    if (couple && !couple.isGhost) {
      kinships.push(getSimpleKinshipModel(person, couple, constants.coupleKinshipType));
    }
    // Get father
    const father = await getFather(person.id);
    // If there is at least a father, then the person has a tree...
    if (father) {
      // Attach father
      if (!father.isGhost) {
        kinships.push(getSimpleKinshipModel(person, father, constants.fatherKinshipType));
      }
      // Get and attach mother
      const mother = await getMother(person.id);
      if (mother && !mother.isGhost) {
        kinships.push(getSimpleKinshipModel(person, mother, constants.motherKinshipType));
      }
      // Get and attach siblings
      const siblings = await getSiblings(person.id, father.id);
      siblings.forEach(s => {
        if (s && !s.isGhost) {
          kinships.push(getSimpleKinshipModel(person, s, constants.siblingKinshipType));
        }
      });
      // Get and attach paternal grandfather
      const paternalGrandfather = await getFather(father.id);
      if (paternalGrandfather && !paternalGrandfather.isGhost) {
        kinships.push(getSimpleKinshipModel(person, paternalGrandfather, constants.paternalGrandfatherKinshipType));
      }
      // Get and attach paternal grandmother
      const paternalGrandmother = await getMother(father.id);
      if (paternalGrandmother && !paternalGrandmother.isGhost) {
        kinships.push(getSimpleKinshipModel(person, paternalGrandmother, constants.paternalGrandmotherKinshipType));
      }
      // Get and attach maternal grandfather
      const maternalGrandfather = await getFather(mother.id);
      if (maternalGrandfather && !maternalGrandfather.isGhost) {
        kinships.push(getSimpleKinshipModel(person, maternalGrandfather, constants.maternalGrandfatherKinshipType));
      }
      // Get and attach maternal grandmother
      const maternalGrandmother = await getMother(mother.id);
      if (maternalGrandmother && !maternalGrandmother.isGhost) {
        kinships.push(getSimpleKinshipModel(person, maternalGrandmother, constants.maternalGrandmotherKinshipType));
      }
    }
    return kinships;
  }

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
    const phoneRegex = /^([0-9]){6,9}$/;
    const emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    if (![1, 2].includes(contactTypeId)) {
      errors.push('Invalid submitted contact type');
    } else if (contactTypeId === 1 && !phoneRegex.test(contact)) {
      errors.push('Invalid phone format');
    } else if (contactTypeId === 2 && !emailRegex.test(contact)) {
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
    const dniRegex = /^[0-9]{1,8}$/;
    const passportRegex = /^([a-zA-Z0-9]){1,12}$/;
    const foreignCardRegex = /^([a-zA-Z0-9]){1,12}$/;
    if (!documentTypeId) {
      errors.push('The document field is required');
    } else if (![1, 2, 3].includes(documentTypeId)) {
      errors.push('Invalid submitted document type');
    } else if (documentTypeId === 1 && !dniRegex.test(document)) {
      errors.push('Invalid DNI format');
    } else if (documentTypeId === 2 && !passportRegex.test(document)) {
      errors.push('Invalid passport format');
    } else if (documentTypeId === 3 && !foreignCardRegex.test(document)) {
      errors.push('Invalid foreign card format');
    }
  }

  async function validateFamilyTree(kinship, errors) {
    // Assuming that the personId and the relativeId are valid
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    const personKinships = await getPersonKinships(person);
    const relativeKinships = await getPersonKinships(relative);
    if (personKinships.some(k => k.relativeId === relative.id) || relativeKinships.some(k => k.relativeId === person.id)) {
      errors.push('The person and the relative are already related');
    }
  }

  function validateGender(genderId, errors) {
    if (!genderId) {
      errors.push('The gender field is required');
    } else if (![1, 2].includes(genderId)) {
      errors.push('Invalid submitted gender');
    }
  }

  async function validateKinshipData(kinship, errors) {
    // Validate person
    if (!kinship.personId) {
      errors.push('The person id is required');
    } else {
      const person = await personModel.findOne({ where: { id: kinship.personId } });
      if (!person || person.isGhost) {
        errors.push('Invalid submitted person');
      }
    }
    // Validate relative
    if (!kinship.relativeId) {
      errors.push('The relative id is required');
    } else if (kinship.personId === kinship.relativeId) {
      errors.push('The relative can\'t be the same as the person');
    } else {
      const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
      if (!relative || relative.isGhost) {
        errors.push('Invalid submitted relative');
      }
    }
    // Validate kinship type
    if (!getKinshipTypeIds().includes(kinship.kinshipType)) {
      errors.push('Invalid submitted kinship type');
    }
  }

  async function validateKinshipGender(kinship, errors) {
    // Assuming that the personId, the relativeId and the kinshipType are valid
    const maleKinshipTypes = [
      constants.fatherKinshipType.id,
      constants.paternalGrandfatherKinshipType.id,
      constants.maternalGrandfatherKinshipType.id
    ];
    const femaleKinshipTypes = [
      constants.motherKinshipType.id,
      constants.paternalGrandmotherKinshipType.id,
      constants.maternalGrandmotherKinshipType.id
    ];
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    if (maleKinshipTypes.includes(kinship.kinshipType) && relative.genderId === 2) {
      errors.push('The relative must be a male');
    } else if (femaleKinshipTypes.includes(kinship.kinshipType) && relative.genderId === 1) {
      errors.push('The relative must be a female');
    } else if (kinship.kinshipType === constants.coupleKinshipType.id && person.genderId === relative.genderId) {
      errors.push('The person and the relative must not have the same gender');
    }
  }

  function validateLastName(lastName, errors) {
    const lastNameRegex = /^[a-zA-ZñÑ'\s]{1,25}$/;
    if (!lastName) {
      errors.push('The last name field is required');
    } else if (!lastNameRegex.test(lastName)) {
      errors.push('Invalid last name format');
    }
  }

  function validateName(name, errors) {
    const nameRegex = /^[a-zA-ZñÑ'\s]{1,25}$/;
    if (!name) {
      errors.push('The name field is required');
    } else if (!nameRegex.test(name)) {
      errors.push('Invalid name format');
    }
  }

  return {
    getPersonKinships,
    validateBirthdate,
    validateContact,
    validateCountry,
    validateDocument,
    validateFamilyTree,
    validateGender,
    validateKinshipData,
    validateKinshipGender,
    validateLastName,
    validateName
  };
}
