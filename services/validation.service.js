"use strict";

const constants = require("./constants");

module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;

  function getRootParentsRecursive(kinships, personId) {
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType);
    const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType);
    const fatherIsRootPerson = await

    if (fatherKinship) {
      return getRootFatherIdRecursive(kinships, fatherKinship.relativeId);
    } else {
      return personId;
    }
  }

  async function isRootPerson(personId) {
    const kinships = await kinshipModel.findAll({ where: { personId } });
    return kinships.length === 0 || kinships[0].kinshipType === constants.coupleKinshipType;
  }

  function isValidKinshipType(kinshipType) {
    return (
      kinshipType === constants.fatherKinshipType ||
      kinshipType === constants.motherKinshipType ||
      kinshipType === constants.coupleKinshipType
    );
  }

  async function isValidPerson(personId) {
    const person = await personModel.findOne({ where: { id: personId } });
    return person !== null;
  }

  async function kinshipAlreadyExists(personId, relativeId) {
    const kinship = await kinshipModel.findOne({ where: { personId, relativeId } });
    return kinship !== null;
  }

  async function shareSameRoot(person1Id, person2Id) {
    const mIsRootPerson1 = await isRootPerson(person1Id);
    const mIsRootPerson2 = await isRootPerson(person2Id);
    if (mIsRootPerson1 && mIsRootPerson2) {
      return false;
    } else {
      if (mIsRootPerson1) {
        
      } else if (mIsRootPerson2) {
        
      } else {

      }
    }
  }

  async function validateKinshipCreation(personId, relativeId, kinshipType) {
    // Validate given data
    const mIsValidPerson = await isValidPerson(personId);
    const mIsValidRelative = await isValidPerson(relativeId);
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    if (!mIsValidPerson || !mIsValidRelative || !mIsValidKinshipType) {
      return false;
    }
    // Validate kinship existance
    const mKinshipAlreadyExists = kinshipAlreadyExists(personId, relativeId);
    if (mKinshipAlreadyExists) {
      return false;
    }
    // Validate already related
    
  }

  return {
    validateAll
  };
};
