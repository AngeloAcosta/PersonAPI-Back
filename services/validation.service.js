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
    const result = kinshipType === constants.fatherKinshipType ||
    kinshipType === constants.motherKinshipType ||
    kinshipType === constants.coupleKinshipType ||
    kinshipType === constants.grandmotherKinshipType ||
    kinshipType === constants.grandfatherKinshipType;
    if (!result) {
      console.log('Invalid kinship type');
      
    }
    return result;
  }

  async function isValidPerson(personId) {
    const person = await personModel.findOne({ where: { id: personId } });
    if (person === null) { 
      console.log('Invalid person');
    }
    return person !== null;
  }
  async function kinshipAlreadyExists(personId, relativeId) {
    const kinship = await kinshipModel.findOne({
      where: { personId: personId, relativeId: relativeId }
    });
   
    if(kinship !== null){
      console.log('Kinship already exists');
      
       return true} 
       
       return false;
  }
 
  async function isIncorrectGenderFather(relativeId) {
    const Person= await personModel.findOne({where: { id: relativeId}})
    if (Person.genderId === 1 ){
      return true;
    }
    console.log('Incorrect gender father');
    return false;
  }
<<<<<<< HEAD
  async function isIncorrectGenderMother(relativeId) {
    const Person= await personModel.findOne({where: { id: relativeId}})
    if (Person.genderId === 2 ){
      return true;
=======
  async function isIncorrectGenderMother(relativeGenderId, kinshipType) {
    if (kinshipType == constants.motherKinshipType) {
      return relativeGenderId == 2;
>>>>>>> 0fddff93aee1aa8851530ea986fee84fd93d325d
    }
    console.log('Incorrect gender mother');
    return false;


    }
  

  async function isIncorrectGenderGrandFather(relativeId) {
    const Person= await personModel.findOne({where: { id: relativeId}})
    if (Person.genderId === 1 ){
      return true;
    }return false;
  }

  async function isIncorrectGenderGrandMother(relativeId) {
    const Person= await personModel.findOne({where: { id: relativeId}})
    if (Person.genderId === 2 ){
      return true;
    }return false;
  }

<<<<<<< HEAD
 


 async function isValidGenderForKinshipType(
    relativeId,
    kinshipType
=======
  function isValidGenderForKinshipType(
    genderId,
    relativeGenderId,
    kinshipType //M
>>>>>>> 0fddff93aee1aa8851530ea986fee84fd93d325d
  ) {
    switch (kinshipType) {
      case 'M':
      return await  isIncorrectGenderMother(relativeId);
      case 'F':
      return await  isIncorrectGenderFather(relativeId)
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

  async function searchSpace(){
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
    arrF = arrF.filter((t={}, a=> !(t[a]=a in t) ));
    for (let index = 0; index < arrF.length; index++) {
      for (let i = 0; i < arr.length; i++) {
        if(arr[i][0]==arrF[index][0]){
          arrF[index].push(arr[i][1]);
        } else if(arr[i][1]==arrF[index][0]){
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
    const misValidGenderForKinshipType = await isValidGenderForKinshipType(
      relativeId,
      kinshipType
    );
    const mKinshipAlreadyExists = await kinshipAlreadyExists(personId, relativeId);
    
    if (
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
    
    if (!mMother || !mkinship) {
      return false;
    }
    return true;
  }
  function TypeKinship(personId, relativeId, kinshipType) {}

  function validateKinshipCreation(personId, relativeId, kinshipType) {
<<<<<<< HEAD
    
=======
   
>>>>>>> 0fddff93aee1aa8851530ea986fee84fd93d325d
    switch (kinshipType) {
      case "M":
      return kinshipSecondLevel(personId, relativeId, kinshipType);
      case "F":
        return kinshipSecondLevel(personId, relativeId, kinshipType);
      case "C":
        return kinshipCouple(personId, relativeId, kinshipType);
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
