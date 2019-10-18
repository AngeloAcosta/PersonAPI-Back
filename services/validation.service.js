"use strict";

const constants = require("./constants");
const sequelize = require("sequelize");

module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;
  var cer = [];
  function isValidKinshipType(kinshipType) {
    const result =
      kinshipType === constants.fatherKinshipType ||
      kinshipType === constants.motherKinshipType ||
      kinshipType === constants.coupleKinshipType ||
      kinshipType === constants.grandmotherKinshipType ||
      kinshipType === constants.grandfatherKinshipType;//UPDATE CONS
    if (!result) {
      console.log("Invalid kinship type");
    }
    return result;
  }
  async function isValidPerson(personId) {
    const person = await personModel.findOne({ where: { id: personId } });
    if (person === null) {
      console.log("Invalid person");
    }
    return person !== null;
  }
  async function kinshipAlreadyExists(personId, relativeId) {
    const kinship = await kinshipModel.findOne({
      where: { personId: personId, relativeId: relativeId }
    });
    if (kinship !== null) {
      console.log("Kinship already exists");
      return true;
    }
    return false;
  }

  async function verifyGenderFather(relativeId) {
    const Person = await personModel.findOne({ where: { id: relativeId } });
    if (Person.genderId === 1) {
      return true;
    }
    console.log("Incorrect gender father");
    return false;
  }
  async function verifyGenderMother(relativeId) {
    const Person = await personModel.findOne({ where: { id: relativeId } });
    if (Person.genderId === 2) {
      return true;
    }
    console.log("Incorrect gender mother");
    return false;
  }

  async function isValidGenderForKinshipType(personId,relativeId,kinshipType) {
    switch (kinshipType) {
      case "M":
        return await verifyGenderMother(relativeId);
      case "F":
        return await verifyGenderFather(relativeId);
      case "C":
        return await GenderCouple(personId,relativeId)
        default:
          return "Default Gender"
    }
  }

  function isInTheSameTree(personId, relativeId) {
    var flag = false;
    flag = processData([[personId]], relativeId);
    return flag;
  }

  function processData(pil, end) {
    var trayectoria_nueva = [];
    var prim = [];
    var last;
    do {
      if (pil.length === 0) {
        return false;
      }
      prim = pil[0];
      pil.shift();
      last = prim[0];
      if (last == end) {
        return true;
      }
      trayectoria_nueva = Object.values(newTrajectory(last, prim));
      for (var i = 0; i < pil.length; i++) {
        trayectoria_nueva.push(pil[i]);
      }
      pil = trayectoria_nueva;
    } while (true);
  }
  function newTrajectory(last, prim) {
    var tray_nuev = [];
    var lb = [];
    if (cer.includes(last)) {
      return [];
    }
    cer = [last, ...cer];
    for (var i = 0; i < Object.values(searchSpace()).length; i++) {
      if (Object.values(searchSpace())[i][0] == last) {
        lb = Object.values(searchSpace())[i];
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
  async function searchSpace() {
    let arr = [];
    let arrF = [];
    let t;
    const eb = await kinshipModel.findAll({
      attributes: ["personId", "relativeId"]
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
  async function GenderCouple(personId, relativeId) {
    const person1 = await personModel.findOne({ where: { id: personId } });
    const person2 = await personModel.findOne({ where: { id: relativeId } });
    if (person1.genderId != person2.genderId) {
      return true;
    }
    return false;
  }

  async function kinshipSecondLevel(personId, relativeId, kinshipType) {
    const mIsInTheSameTree = await isInTheSameTree(personId, relativeId);
    const mIsValidPerson = await isValidPerson(personId);
    const mIsValidRelative = await isValidPerson(relativeId);
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    const misValidGenderForKinshipType = await isValidGenderForKinshipType(
      personId,
      relativeId,
      kinshipType
    );
    const mKinshipAlreadyExists = await kinshipAlreadyExists(
      personId,
      relativeId
    );
console.log(mIsInTheSameTree);
console.log(mIsValidPerson);
console.log(mIsValidRelative);
console.log(mIsValidKinshipType);
console.log(misValidGenderForKinshipType);
console.log(mKinshipAlreadyExists);
console.log(processData(4,17));
    if (
      !mIsInTheSameTree &&
      mIsValidPerson &&
      mIsValidRelative &&
      mIsValidKinshipType &&
      misValidGenderForKinshipType &&
      !mKinshipAlreadyExists
    ) {
      return true;
    }
    return false;
  }
  function kinshipCouple(personId, relativeId, kinshipType) {
    const mGenderCouple = GenderCouple(personId, relativeId);
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

    if (!mMother || !mkinship) {
      return false;
    }
    return true;
  }
  function transformKinship(kinshipTypeT) {
    switch (kinshipTypeT) {
      case "GFF":
        return kinshipTypeT == 'F'
      case "GFM":
        return kinshipTypeT == 'F'
      case "GMF":
        return kinshipTypeT == 'M'
      case "GMM":
        return kinshipTypeT == 'M'
      default :
      break;
    }
  }
  function validateKinshipCreation(personId, relativeId, kinshipType) {
    //const kinshipTypeT = transformKinship(kinshipType)
    switch (kinshipType) {
      case "M":
        return kinshipSecondLevel(personId, relativeId, kinshipType);
      case "F":
        /*if(kinshipType == 'GFF'){ kinshipGF(personId,relativeId)}if (kinshipType == 'GMF') {
          kinshipGM(personId,relativeId)         
        }*/
        return kinshipSecondLevel(personId, relativeId, kinshipType);
      case "C":
        return kinshipSecondLevel(personId, relativeId, kinshipType);
      /*  case "G":
        return kinshipGF(personId, relativeId, kinshipType);
      case "GM":
        return kinshipGM(personId, relativeId, kinshipType);*/
      default:
        console.log("It just appear for default");
        break;
    }
  }
  return {
    validateKinshipCreation,
    searchSpace
  };
};
