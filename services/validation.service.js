'use strict';

const constants = require('./constants');
const sequelize = require('sequelize');

module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;
  var cer = [];

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

  function validateGender(genderId, errors) {
    if (!genderId) {
      errors.push('The gender field is required');
    } else if (![1, 2].includes(genderId)) {
      errors.push('Invalid submitted gender');
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
  function isValidKinshipType(kinshipType) {
    const result =
      kinshipType === constants.fatherKinshipType.id ||
      kinshipType === constants.motherKinshipType.id ||
      kinshipType === constants.coupleKinshipType.id ||
      kinshipType === constants.paternalGrandfatherKinshipType.id ||
      kinshipType === constants.maternalGrandfatherKinshipType.id ||
      kinshipType === constants.paternalGrandmotherKinshipType.id ||
      kinshipType === constants.maternalGrandmotherKinshipType.id ||
      kinshipType === constants.siblingKinshipType.id;
    return result;
  }
  async function isValidPerson(id) {
    const person = await personModel.findOne({ where: { id } });
    return person && !person.isGhost;
  }
  async function kinshipAlreadyExists(personId, relativeId, kinshipType) {
    const kinship = await kinshipModel.findOne({
      where: { personId: personId, relativeId: relativeId }
    });
    const kinshipRepet = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: kinshipType }
    });
    if (kinshipRepet != null) {
      const person = await personModel.findOne({
        where: {
          id: kinshipRepet.relativeId
        }
      });
      if (person.isGhost == 1) {
        return kinship !== null;
      } else {
        return kinship !== null || kinshipRepet !== null;
      }
    } else {
      return kinship !== null;
    }
  }

  async function verifyGenderFather(relativeId) {
    const Person = await personModel.findOne({ where: { id: relativeId } });
    return Person.genderId === 1;
  }

  async function verifyGenderMother(relativeId) {
    const Person = await personModel.findOne({ where: { id: relativeId } });
    return Person.genderId === 2;
  }
  async function isValidGenderForKinshipType(
    personId,
    relativeId,
    kinshipType
  ) {
    const kinshipTypeT = transformKinship(kinshipType);
    switch (kinshipTypeT) {
      case 'M':
        return await verifyGenderMother(relativeId);
      case 'F':
        return await verifyGenderFather(relativeId);
      case 'C':
        return await verifyGenderCouple(personId, relativeId);
      default:
        return 'DEFAULT VALID GENDER FOR KINSHIP TYPE';
    }
  }

  async function isInTheSameTree(personId, relativeId) {
    let flag = false;
    let pil = [];
    let arr = [];
    arr.push(personId);
    pil.push(arr);
    flag = await processData(pil, relativeId);
    return flag;
  }

  async function processData(pil, end) {
    let mNewTrajectory = [];
    let prim = [];
    let last;
    do {
      if (pil.length === 0) {
        return false;
      }
      prim = pil[0];
      pil.splice(0, 1);
      last = prim[0];
      if (last == end) {
        return true;
      }
      mNewTrajectory = await newTrajectory(last, prim);
      for (var i = 0; i < pil.length; i++) {
        mNewTrajectory.push(pil[i]);
      }
      pil = mNewTrajectory;
    } while (true);
  }
  async function newTrajectory(last, prim) {
    let mNewTrajectory = [];
    let lb = [];
    if (cer.includes(last)) {
      return [];
    }
    cer = [last, ...cer];
    const searchSpaceC = await searchSpace();
    for (var i = 0; i < searchSpaceC.length; i++) {
      if (searchSpaceC[i][0] == last) {
        lb = searchSpaceC[i];
        break;
      }
    }
    for (let index = 0; index < lb.length; index++) {
      for (let j = 0; j < cer.length; j++) {
        if (lb[index] == cer[j]) {
          lb.splice(index, 1);
        }
      }
    }
    for (var i = 0; i < lb.length; i++) {
      var temp = [];
      temp.push(lb[i]);
      for (var j = 0; j < prim.length; j++) {
        temp.push(prim[j]);
      }
      mNewTrajectory.push(temp);
    }
    return mNewTrajectory;
  }
  async function searchSpace() {
    let arr = [];
    let arrF = [];
    let t;
    const eb = await kinshipModel.findAll({
      attributes: ['personId', 'relativeId']
    });
    arr = eb.map(k => {
      return [k.personId, k.relativeId];
    });
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        let arrTemp = [];
        arrTemp.push(arr[i][j]);
        arrF.push(arrTemp);
      }
    }
    arrF = arrF.filter(((t = {}), a => !(t[a] = a in t)));
    for (let index = 0; index < arrF.length; index++) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] == arrF[index][0]) {
          arrF[index].push(arr[i][1]);
        } else if (arr[i][1] == arrF[index][0]) {
          arrF[index].push(arr[i][0]);
        }
      }
    }
    return arrF;
  }
  async function validatoGMotherM(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.motherKinshipType.id }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 2,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.motherKinshipType.id
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.motherKinshipType.id
      });
    }
    if (personObject != null) {
      const sameMother = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.motherKinshipType.id
        }
      });
      if (sameMother.relativeId != relativeId) {
        return false;
      }
      if (sameMother == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.motherKinshipType.id
        });
      } else {
        if (sameMother.relativeId != relativeId) {
          return false;
        }
      }
    }
  }
  async function validatoGMotherF(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.fatherKinshipType.id }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 2,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.fatherKinshipType.id
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.motherKinshipType.id
      });
    }
    if (personObject != null) {
      const sameMother = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.motherKinshipType.id
        }
      });
      if (sameMother == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.motherKinshipType.id
        });
      } else if (sameMother.relativeId != relativeId) {
        return false;
      }
    }
  }
  async function validatoGFatherM(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.motherKinshipType.id }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 1,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.motherKinshipType.id
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.fatherKinshipType.id
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.fatherKinshipType.id
        }
      });

      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.fatherKinshipType.id
        });
      } else {
        if (sameFather.relativeId != relativeId) {
          return false;
        }
      }
    }
  }
  async function validatoGFatherF(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.fatherKinshipType.id }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 1,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.fatherKinshipType.id
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.fatherKinshipType.id
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.fatherKinshipType.id
        }
      });
      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.fatherKinshipType.id
        });
      } else {
        if (sameFather.relativeId != relativeId) {
          return false;
        }
      }
    }
  }
  async function validateSibling(personId, relativeId) {
    const person = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.fatherKinshipType.id }
    });
    const person2 = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.motherKinshipType.id }
    });
    if (person == null && person2 == null) {
      const ghostF = await createGhost(1);
      const ghostM = await createGhost(2);
      await createKinship(personId, ghostF.id, constants.fatherKinshipType.id);
      await createKinship(personId, ghostM.id, constants.motherKinshipType.id);
      await createKinship(
        relativeId,
        ghostF.id,
        constants.fatherKinshipType.id
      );
      await createKinship(
        relativeId,
        ghostM.id,
        constants.motherKinshipType.id
      );
    } else if (person != null && person2 != null) {
      await createKinship(
        relativeId,
        person.relativeId,
        constants.fatherKinshipType.id
      );
      await createKinship(
        relativeId,
        person2.relativeId,
        constants.motherKinshipType.id
      );
    } else if (person == null && person2 != null) {
      const ghostF = await createGhost(1);
      await createKinship(
        person2.personId,
        ghostF.id,
        constants.fatherKinshipType.id
      );
      await createKinship(
        relativeId,
        ghostF.id,
        constants.fatherKinshipType.id
      );
      await createKinship(relativeId, person2.relativeId, person2.kinshipType);
    } else {
      const ghostM = await createGhost(2);
      await createKinship(
        person2.personId,
        ghostM.id,
        constants.motherKinshipType.id
      );
      await createKinship(
        relativeId,
        ghostM.id,
        constants.motherKinshipType.id
      );
      await createKinship(
        relativeId,
        person2.relativeId,
        constants.fatherKinshipType.id
      );
    }
  }

  async function createKinship(personId, relativeId, kinshipType) {
    const createKinship = await kinshipModel.create({
      personId: personId,
      relativeId: relativeId,
      kinshipType: kinshipType
    });
    return createKinship;
  }
  async function createGhost(genderId) {
    const ghost = await personModel.create({
      genderId: genderId,
      isGhost: 1
    });
    return ghost;
  }

  async function verifyGenderCouple(personId, relativeId) {
    const person1 = await personModel.findOne({ where: { id: personId } });
    const person2 = await personModel.findOne({ where: { id: relativeId } });
    return person1.genderId != person2.genderId;
  }
  async function alreadyHasCouple(personId, relativeId) {
    const kinship = await kinshipModel.findOne({
      where: {
        relativeId: personId,
        kinshipType: constants.coupleKinshipType.id
      }
    });
    const kinship2 = await kinshipModel.findOne({
      where: {
        personId: personId,
        kinshipType: constants.coupleKinshipType.id
      }
    });
    const kinship3 = await kinshipModel.findOne({
      where: {
        relativeId: relativeId,
        kinshipType: constants.coupleKinshipType.id
      }
    });
    const kinship4 = await kinshipModel.findOne({
      where: {
        personId: relativeId,
        kinshipType: constants.coupleKinshipType.id
      }
    });
    return (
      kinship == null &&
      kinship2 == null &&
      kinship3 == null &&
      kinship4 == null
    );
  }

  async function kinshipValidations(personId, relativeId, kinshipType) {
    let errors = [];
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    const mKinshipAlreadyExists = await kinshipAlreadyExists(
      personId,
      relativeId,
      kinshipType
    );
    const mIsInTheSameTree = await isInTheSameTree(personId, relativeId);
    const mAlreadyHasCouple = await alreadyHasCouple(personId, relativeId); // Include this in kinshipAlreadyExists
    const mIsValidGenderForKinshipType = await isValidGenderForKinshipType(
      personId,
      relativeId,
      kinshipType
    );
    if (!mIsValidKinshipType) {
      errors.push('Kinship Type is not valid');
    }
    if (mKinshipAlreadyExists) {
      errors.push('Kinship already exists');
    }
    if (mIsInTheSameTree) {
      errors.push('These people share the same tree');
    }
    if (!mIsValidGenderForKinshipType) {
      errors.push('Gender is not valid');
    }
    if (!mAlreadyHasCouple) {
      errors.push('Already have couple');
    }
    return errors;
  }
  function kinshipGFM(personId, relativeId) {
    const mFather = validatoGFatherM(personId, relativeId);
    if (!mFather) {
      return false;
    }
    return true;
  }
  function kinshipGMM(personId, relativeId) {
    const mFather = validatoGMotherM(personId, relativeId);
    if (!mFather) {
      return false;
    }
    return true;
  }
  function kinshipGFF(personId, relativeId) {
    const mFather = validatoGFatherF(personId, relativeId);
    if (!mFather) {
      return false;
    }
    return true;
  }
  function kinshipGMF(personId, relativeId, kinshipType) {
    const mMother = validatoGMotherF(personId, relativeId, kinshipType);
    if (!mMother) {
      return false;
    }
    return true;
  }
  function kinshipS(personId, relativeId, kinshipType) {
    const mSibling = validateSibling(personId, relativeId, kinshipType);
    if (!mSibling) {
      return false;
    }
    return true;
  }

  async function kinshipP(personId, relativeId, kinshipType) {
    const relative = await kinshipModel.findOne({
      where: {
        personId: personId,
        kinshipType: kinshipType
      }
    });

    if (relative != null) {
      const person = await personModel.findOne({
        where: {
          id: relative.relativeId
        }
      });
      if (person.isGhost == 1) {
        await kinshipModel.update(
          { personId: relativeId },
          { where: { personId: person.id } }
        );
        await kinshipModel.update(
          { relativeId: relativeId },
          { where: { relativeId: person.id } }
        );
      } else {
        await kinshipModel.create({
          personId: personId,
          relativeId: relativeId,
          kinshipType: kinshipType
        });
      }
    } else {
      await kinshipModel.create({
        personId: personId,
        relativeId: relativeId,
        kinshipType: kinshipType
      });
    }
  }

  async function kinshipC(personId, relativeId) {
    await kinshipModel.create({
      personId: personId,
      relativeId: relativeId,
      kinshipType: constants.coupleKinshipType.id
    });
    await kinshipModel.create({
      personId: relativeId,
      relativeId: personId,
      kinshipType: constants.coupleKinshipType.id
    });
  }
  function createKinships(personId, relativeId, kinshipType) {
    switch (kinshipType) {
      case constants.paternalGrandfatherKinshipType.id:
        return kinshipGFF(personId, relativeId, 'F');
      case constants.maternalGrandfatherKinshipType.id:
        return kinshipGFM(personId, relativeId, 'F');
      case constants.paternalGrandmotherKinshipType.id:
        return kinshipGMF(personId, relativeId, 'M');
      case constants.maternalGrandmotherKinshipType.id:
        return kinshipGMM(personId, relativeId, 'M');
      case constants.siblingKinshipType.id:
        return kinshipS(personId, relativeId, 'S');
      case constants.coupleKinshipType.id:
        return kinshipC(personId, relativeId);
      default:
        return kinshipP(personId, relativeId, kinshipType);
    }
  }
  function transformKinship(kinshipTypeT) {
    switch (kinshipTypeT) {
      case constants.paternalGrandfatherKinshipType.id:
        return (kinshipTypeT = 'F');
      case constants.maternalGrandfatherKinshipType.id:
        return (kinshipTypeT = 'F');
      case constants.paternalGrandmotherKinshipType.id:
        return (kinshipTypeT = 'M');
      case constants.maternalGrandmotherKinshipType.id:
        return (kinshipTypeT = 'M');
      default:
        return kinshipTypeT;
    }
  }

  return {
    isValidPerson,
    kinshipValidations,
    createKinships,
    validateBirthdate,
    validateContact,
    validateCountry,
    validateDocument,
    validateGender,
    validateLastName,
    validateName
  };
};
