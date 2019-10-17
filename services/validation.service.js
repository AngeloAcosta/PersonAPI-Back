"use strict";

const constants = require("./constants");

module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;
  var cer = [];

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

  function isIntheSameTree(personId, relativeId) {
    var pil = [[]];
    var temp = [];
    temp.push(personId);
    pil.push(temp);
    procesa([["S"]], "G");
  }

  function procesa(pil, fin) {
    var trayectoria_nueva = [];
    var prim = [];
    var ult = "";
    do {
      console.log(pil);
      if (pil === []) {
        console.log("No hay solución");
      }
      prim = pil[0];
      pil.shift();
      ult = prim[0];
      if (ult == fin) {
        console.log(prim);
        break;
      }
      trayectoria_nueva = Object.values(trayectoriaNueva(ult, prim));
      for (var i = 0; i < pil.length; i++) {
        trayectoria_nueva.push(pil[i]);
      }
      pil = trayectoria_nueva;
    } while (true);
  }

  function trayectoriaNueva(ult, prim) {
    var tray_nuev = [];
    var lb = [];
    if (cer.includes(ult)) {
      return [];
    }
    cer = [ult, ...cer];
    for (var i = 0; i < Object.values(espacioBusqueda()).length; i++) {
      if (Object.values(espacioBusqueda())[i][0] == ult) {
        lb = Object.values(espacioBusqueda())[i];
        break;
      }
    }
    lb = lb.filter(x => !cer.includes(x));
    for (var i = 0; i < lb.length; i++) {
      var temp = [];
      temp.push(lb[i]);
      for (var j = 0; j < prim.length; j++) {
        temp.push(prim[j]);
      }
      tray_nuev.push(temp);
    }
    return tray_nuev;
  }

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
    const mIsInTheSameTree = isIntheSameTree(personId, relativeId);

    const mIsValidGenderForKinshipType = isValidGenderForKinshipType(
      person1.genderId,
      person2.genderId,
      kinshipType
    );
    if (!mIsValidPerson || !mIsValidRelative || !mIsValidKinshipType) {
      return false;
    }
    // Validate kinship existance
    if (mKinshipAlreadyExists) {
      return false;
    }
    // Validate incorrect gender kinship
    if (mIsValidGenderForKinshipType) {
      return false;
    }

    if (mIsInTheSameTree) {
      return false;
    }
    return true;
  }
  return {
    validateKinshipCreation
  };
};
