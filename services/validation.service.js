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
    const mKinshipAlreadyExists = kinshipAlreadyExists(personId, relativeId);
    const mIsSameGenderCouple = isSameGenderCouple(personId, relativeId, kinshipType);
    const mIsOlderThanParents = isOlderThanParents(personId, relativeId, kinshipType);
    if (!mIsValidPerson || !mIsValidRelative || !mIsValidKinshipType) {
      return false;
    } 
    // Validate kinship existance
    if (mKinshipAlreadyExists) {
      return false;
    }

    // Validate opposite sex of couple
    if(mIsSameGenderCouple){
      return false;
    } 
    //Validate age
    if(mIsOlderThanParents){
      return false;
    }
    //Validar si papa es Masculino y mama es Femenino
    
  }
  return {
    validateKinshipCreation
  };
};
