"use strict";

const constants = require("./constants");

module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;
  function isValidKinshipType(kinshipType) {
    return (
      kinshipType === constants.fatherKinshipType ||
      kinshipType === constants.motherKinshipType ||
      kinshipType === constants.coupleKinshipType
    );
  }

  async function isOlderThanParents(personId, relativeId, kinshipType) {
    const person1 = await personModel.findOne({ where: { personId } });
    const person2 = await personModel.findOne({ where: { relativeId } });
    if (
      kinshipType === constants.fatherKinshipType ||
      kinshipType === constants.motherKinshipType
    ) {
      if (person1.birthdate > person2) {
        return true;
      }
    } else {
    }
  }

  async function isValidPerson(personId) {
    const person = await personModel.findOne({ where: { id: personId } });
    return person !== null;
  }

  async function kinshipAlreadyExists(personId, relativeId) {
    const kinship = await kinshipModel.findOne({
      where: { personId, relativeId }
    });
    return kinship !== null;
  }

  async function isSameGenderCouple(genderId, relativeGenderId, kinshipType) {
    if (kinshipType == constants.coupleKinshipType) {
      return genderId === relativeGenderId;
    }
  }

  async function isIncorrectGenderParents(relativeId, kinshipType) {
    const person = await personModel.findOne({ where: { relativeId } });
    if (kinshipType == constants.fatherKinshipType) {
      if (person.genderId == 1) {
        return true;
      } else {
        return false;
      }
    } else if (kinshipType == constants.motherKinshipType) {
      if (person.genderId == 2) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  async function isIncorrectGenderFather() {}
  async function isIncorrectGenderMother() {}

  function isValidGenderForKinshipType(personId, relativeId, kinshipType) {
    return (
      isIncorrectGenderParents(relativeId, kinshipType) ||
      isSameGenderCouple(personId, relativeId, kinshipType)
    );
  }

  /*async function shareSameRoot(person1Id, person2Id) {
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
  }*/

  async function validateKinshipCreation(personId, relativeId, kinshipType) {
    const person1 = await personModel.findOne({ where: { personId } });
    const person2 = await personModel.findOne({ where: { relativeId } });
    const mIsValidPerson = await isValidPerson(personId);
    const mIsValidRelative = await isValidPerson(relativeId);
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    const mKinshipAlreadyExists = kinshipAlreadyExists(personId, relativeId);
    const mIsSameGenderCouple = isSameGenderCouple(
      person1.genderId,
      person2.genderId,
      kinshipType
    );
    const mIsOlderThanParents = isOlderThanParents(
      personId,
      relativeId,
      kinshipType
    );
    const mIsIncorrectGenderParents = isIncorrectGenderParents(
      relativeId,
      kinshipType
    );
    if (!mIsValidPerson || !mIsValidRelative || !mIsValidKinshipType) {
      return false;
    }
    // Validate kinship existance
    if (mKinshipAlreadyExists) {
      return false;
    }
    // Validate couple gender
    if (mIsSameGenderCouple) {
      return false;
    }
    //Validate age
    /*if (mIsOlderThanParents) {
      return false;
    }
    //Validar si papa es Masculino y mama es Femenino
    if (mIsIncorrectGenderParents) {
      return false;
    }
    //Validar si mi pareja ya tiene pareja en la bd

    return true;
  }
  return {
    validateKinshipCreation
  };*/
  }
};
