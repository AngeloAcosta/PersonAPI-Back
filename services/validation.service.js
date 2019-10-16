"use strict";

const constants = require('./constants');
const sequelize = require('sequelize');
const Op=sequelize.Op;


module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;

  function getRootParentsRecursive(kinships, personId) {
    const fatherKinship = kinships.find(
      k =>
        k.personId === personId && k.kinshipType === constants.fatherKinshipType
    );
    /*const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType);*/

    if (fatherKinship) {
      return getRootFatherIdRecursive(kinships, fatherKinship.relativeId);
    } else {
      return personId;
    }
  }

  /*async function isRootPerson(personId) {
    const kinships = await kinshipModel.findAll({ where: { personId } });
    return (
      kinships.length === 0 ||
      kinships[0].kinshipType === constants.coupleKinshipType
    );
  }*/

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
  async function isIncorrectGenderFather(relativeGenderId, kinshipType) {
    if (kinshipType == constants.fatherKinshipType) {
      return relativeGenderId == 1;
    }
  }
  async function isIncorrectGenderMother(relativeGenderId, kinshipType) {
    if (kinshipType == constants.fatherKinshipType) {
      return relativeGenderId == 2;
    }
  }

  async function isIncorrectGenderGrandFather(relativeGenderId, kinshipType) {
    if (kinshipType == constants.grandfatherKinshipType) {
      return relativeGenderId == 1;
    }
  }

  async function isIncorrectGenderGrandMother(relativeGenderId, kinshipType) {
    if (kinshipType == constants.grandmotherKinshipType) {
      return relativeGenderId == 2;
    }
  }

  async function isIncorrectGenderBrother(relativeGenderId, kinshipType) {
    if (kinshipType == constants.brotherKinshipType) {
      return relativeGenderId == 1;
    }
  }

  async function isIncorrectGenderSister(relativeGenderId, kinshipType) {
    if (kinshipType == constants.sisterKinshipType) {
      return relativeGenderId == 2;
    }
  }

  function isValidGenderForKinshipType(
    genderId,
    relativeGenderId,
    kinshipType
  ) {
    return (
      isSameGenderCouple(genderId, relativeGenderId, kinshipType) ||
      isIncorrectGenderFather(relativeGenderId, kinshipType) ||
      isIncorrectGenderMother(relativeGenderId, kinshipType) ||
      isIncorrectGenderGrandFather(relativeGenderId, kinshipType) ||
      isIncorrectGenderGrandMother(relativeGenderId, kinshipType) ||
      isIncorrectGenderBrother(relativeGenderId, kinshipType) ||
      isIncorrectGenderSister(relativeGenderId, kinshipType)
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
  } */

/*Validación de comparación de edades entre parientes*/
  async function isOlderThanParents(
    personBirthdate,
    relativeBirthdate,
    kinshipType
  ) {
    var start = new Date(personBirthdate);
    var start2 = new Date(relativeBirthdate);
    const year1 = start.getFullYear();
    var year2 = start2.getFullYear();
    if (year1 - year2 > 15) {
      return true;
    }
    return false;
  }

  async function validateKinshipCreation(personId, relativeId, kinshipType) {
    const person1 = await personModel.findOne({ where: { personId } });
    const person2 = await personModel.findOne({ where: { relativeId } });

    const mIsValidPerson = await isValidPerson(personId);
    const mIsValidRelative = await isValidPerson(relativeId);
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    const mKinshipAlreadyExists = kinshipAlreadyExists(personId, relativeId);

    const mIsValidGenderForKinshipType = isValidGenderForKinshipType(
      person1.genderId,
      person2.genderId,
      kinshipType
    );
    if (!mIsValidPerson || !mIsValidRelative || !mIsValidKinshipType) {
      return false;
    }
    // Validate kinship existance
    /*if (mKinshipAlreadyExists) {
      return false;
    }*/
    // Validate couple gender
   /* if (mIsSameGenderCouple) {
      return false;
    }
    //Validate age
    /*if (mIsOlderThanParents) {
      return false;
    }*/
    //Validar si papa es Masculino y mama es Femenino
   /* if (mIsIncorrectGenderParents) {
      return false;
    }*/
    //Validar si mi pareja ya tiene pareja en la bd

    return true;
  }
  return {
    validateKinshipCreation
  };
};
