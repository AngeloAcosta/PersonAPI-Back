"use strict";

const constants = require("./constants");
const sequelize = require("sequelize");

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
    console.log("isValidKinshipType");
    return (
      kinshipType === constants.fatherKinshipType ||
      kinshipType === constants.motherKinshipType ||
      kinshipType === constants.coupleKinshipType ||
      kinshipType === constants.grandmotherKinshipType ||
      kinshipType === constants.grandfatherKinshipType
    );
  }

  async function isValidPerson(personId) {
    const person = await personModel.findOne({ where: { id: personId } });

    return person !== null;
  }
  async function kinshipAlreadyExists(personId, relativeId) {
    const kinship = await kinshipModel.findOne({
      where: { personId: personId, relativeId: relativeId }
    });
    console.log("Already Exist");
    if(kinship !== null){
      console.log("Estoy aqui1");
       return true} 
       
      console.log("Estoy aqui2");
       return false;
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
  async function validatoGMother(personId, GfatherId) {
    const PersonObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: "M" }
    });
    const idpadre = PersonObject.relativeId;

    await kinshipModel.create({
      personId: idpadre,
      relativeId: GfatherId,
      kinshipType: "M"
    });
  }
  async function validatoGFather(personId, GfatherId) {
    const PersonObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: "F" }
    });
    const idpadre = PersonObject.relativeId;

    await kinshipModel.create({
      personId: idpadre,
      relativeId: GfatherId,
      kinshipType: "F"
    });

    if (PersonObject != null) {
      console.log("todo bien");
      return true;
    }
  }
  /*Validación de comparación de edades entre parientes*/
  async function GenderCouple(personId, relativeId, kinshipType) {
    const person1 = await personModel.findOne({ where: { id: personId } });
    const person2 = await personModel.findOne({ where: { id: relativeId } });
    if (person1.genderId != person2.genderId) {
      return true;
    }
    return false;
  }

  async function kinshipSecondLevel(personId, relativeId, kinshipType) {
    const mIsValidPerson = await isValidPerson(personId);
    const mIsValidRelative = await isValidPerson(relativeId);
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    const misValidGenderForKinshipType = isValidGenderForKinshipType(
      personId,
      relativeId,
      kinshipType
    );
    const mKinshipAlreadyExists = kinshipAlreadyExists(personId, relativeId);
    if (
      !mIsValidPerson ||
      !mIsValidRelative ||
      !mIsValidKinshipType ||
      misValidGenderForKinshipType
    ) {
      return false;
    } else if (mKinshipAlreadyExists) {
      return false;
    }
    return true;
  }
  function kinshipCouple(personId, relativeId, kinshipType) {
    const mGenderCouple = GenderCouple(personId, relativeId, kinshipType);
    const mkinship = kinshipSecondLevel(personId, relativeId, kinshipType);
    if (!mGenderCouple || !mkinship) {
      return false;
    }
    return true;
  }
  function kinshipGF(personId, relativeId, kinshipType) {
    const mFather = validatoGFather(personId, relativeId, kinshipType);
    const mkinship = kinshipSecondLevel(personId, relativeId, kinshipType);
    if (!mFather || !mkinship) {
      return false;
    }
    return true;
  }
  function kinshipGM(personId, relativeId, kinshipType) {
    const mkinship = kinshipSecondLevel(personId, relativeId, kinshipType);
    const mMother = validatoGMother(personId, relativeId, kinshipType);
    const mkinship = kinshipSecondLevel(personId, relativeId, kinshipType);
    if (!mMother || !mkinship) {
      return false;
    }
    return true;
  }
  function TypeKinship(personId, relativeId, kinshipType) {}

  function validateKinshipCreation(personId, relativeId, kinshipType) {
    switch (kinshipType) {
      case "M" || "F":
        return kinshipSecondLevel(personId, relativeId, kinshipType);
      case "C":
        return kinshipCouple(personId, relativeId, kinshipType);
      case "GF":
        return kinshipGF(personId, relativeId, kinshipType);
      case "GM":
        return kinshipGM(personId, relativeId, kinshipType);
      default:
        console.log("It just appear for default");
        break;
    }
  }
  return {
    validateKinshipCreation
  };
};
