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
      kinshipType === constants.grandfatherfatherkinshipTyp ||
      kinshipType === constants.grandfathermotherkinshipTyp ||
      kinshipType === constants.grandmotherfatherkinshipTyp ||
      kinshipType === constants.grandmothermotherkinshipTyp ||
      kinshipType === constants.siblingKinshipType;
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
  async function kinshipAlreadyExists(personId, relativeId, kinshipType) {
    const kinship = await kinshipModel.findOne({
      where: { personId: personId, relativeId: relativeId }
    });
    const kinshipRepet = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: kinshipType }
    });
    return kinship !== null || kinshipRepet !== null;
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

  async function isValidGenderForKinshipType(
    personId,
    relativeId,
    kinshipType
  ) {
    const kinshipTypeT = transformKinship(kinshipType);
    switch (kinshipTypeT) {
      case "M":
        return await verifyGenderMother(relativeId);
      case "F":
        return await verifyGenderFather(relativeId);
      case "C":
        return await isValidCouple(personId, relativeId);
      default:
        return "DEFAULT VALID GENDER FOR KINSHIP TYPE";
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
    let trayectoria_nueva = [];
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
        console.log("PRIIMMMMM", prim);
        console.log("PIL", pil);
        return true;
      }
      trayectoria_nueva = await newTrajectory(last, prim);
      for (var i = 0; i < pil.length; i++) {
        trayectoria_nueva.push(pil[i]);
      }
      pil = trayectoria_nueva;
    } while (true);
  }
  async function newTrajectory(last, prim) {
    var tray_nuev = [];
    var lb = [];
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
  async function validatoGMotherM(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: "M" }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 2,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: "M"
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: "M"
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: { personId: personObject.relativeId, kinshipType: "M" }
      });
      if (sameFather.relativeId != relativeId) {
        console.log(
          "Error wrong grandparent , that is not the father of your parent"
        );
        return false;
      }
      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: "M"
        });
      }
    }
  }
  async function validatoGMotherF(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: "F" }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 2,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: "F" //adding kinship father for the ghost and the personID
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: "M"
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: { personId: personObject.relativeId, kinshipType: "M" }
      });
      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: "M"
        });
      } else if (sameFather.relativeId != relativeId) {
        console.log(
          "Error wrong grandparent , that is not the mother of your parent"
        );
        return false;
      }
    }
  }
  async function validatoGFatherM(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: "M" }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 1,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: "M"
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: "F"
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: { personId: personObject.relativeId, kinshipType: "F" }
      });

      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: "F"
        });
      } else {
        if (sameFather.relativeId != relativeId) {
          console.log(
            "Error wrong grandparent , that is not the father of your parent"
          );
          return false;
        }
      }
    }
  }
  async function validatoGFatherF(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: "F" }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 1,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: "F"
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: "F"
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: { personId: personObject.relativeId, kinshipType: "F" }
      });
      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: "F"
        });
      } else {
        if (sameFather.relativeId != relativeId) {
          console.log(
            "Error wrong grandparent , that is not the father of your parent"
          );
          return false;
        }
      }
    }
  }
  async function validateSibling(personId, relativeId) {
    const person = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.fatherKinshipType }
    });
    const person2 = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.motherKinshipType }
    });
    if (person == null && person2 == null) {
      const ghostF = await createGhost(1);
      const ghostM = await createGhost(2);
      await createKinship(personId, ghostF.id, constants.fatherKinshipType);
      await createKinship(personId, ghostM.id, constants.motherKinshipType);
      await createKinship(relativeId, ghostF.id, constants.fatherKinshipType);
      await createKinship(relativeId, ghostM.id, constants.motherKinshipType);
    } else if (person != null && person2 != null) {
      await createKinship(relativeId, person.relativeId, constants.fatherKinshipType);
      await createKinship(relativeId, person2.relativeId, constants.motherKinshipType);
    } else if (person == null && person2 != null) {
      const ghostF = await createGhost(1);
      await createKinship(person.personId, ghostF.id, constants.fatherKinshipType);
      await createKinship(relativeId, ghostF.id, constants.fatherKinshipType);
      await createKinship(relativeId, person2.relativeId, person2.kinshipType);
    } else{
      const ghostM = await createGhost(2);
      await createKinship(person2.personId, ghostM.id, constants.motherKinshipType);
      await createKinship(relativeId, ghostM.id, constants.motherKinshipType);
      await createKinship(relativeId, person2.relativeId, constants.fatherKinshipType);
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
  async function isValidCouple(personId, relativeId) {
    const mGenderCouple = await genderCouple(personId, relativeId);
    const mAlreadyHasCouple = await alreadyHasCouple(personId);

    return mGenderCouple && mAlreadyHasCouple;
  }
  async function genderCouple(personId, relativeId) {
    const person1 = await personModel.findOne({ where: { id: personId } });
    const person2 = await personModel.findOne({ where: { id: relativeId } });
    console.log(person1.genderId, " siguente gender ID ", person2.genderId);
    if (person1.genderId != person2.genderId) {
      return true;
    }
    return false;
    //return genderId!=genderId2;
  }
  async function alreadyHasCouple(personId) {
    const kinship = await kinshipModel.findOne({
      where: {
        relativeId: personId,
        kinshipType: "C"
      }
    });
    console.log(kinship, " KINSHIP DEL RELATIVE ID");

    const kinship2 = await kinshipModel.findOne({
      where: {
        personId: personId,
        kinshipType: "C"
      }
    });
    console.log(kinship2, " KINSHIP DEL Person ID");
    return kinship == null && kinship2 == null;
  }
  async function kinshipSecondLevel(personId, relativeId, kinshipType) {
    const mIsValidPerson = await isValidPerson(personId);
    const mIsValidRelative = await isValidPerson(relativeId);
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    const mKinshipAlreadyExists = await kinshipAlreadyExists(
      personId,
      relativeId,
      kinshipType
    );
    const mIsInTheSameTree = await isInTheSameTree(personId, relativeId);
    const mIsValidForKinshipType = await isValidGenderForKinshipType(
      personId,
      relativeId,
      kinshipType
    );
    console.log(mIsInTheSameTree);
    console.log(mIsValidPerson);
    console.log(mIsValidRelative);
    console.log(mIsValidKinshipType);
    console.log(mIsValidForKinshipType);
    console.log(mKinshipAlreadyExists);
    if (
      !mIsInTheSameTree &&
      mIsValidPerson &&
      mIsValidRelative &&
      mIsValidKinshipType &&
      mIsValidForKinshipType &&
      !mKinshipAlreadyExists
    ) {
      return true;
    }
    return false;
  }
  function kinshipGFM(personId, relativeId, kinshipType) {
    console.log(kinshipType);
    const mFather = validatoGFatherM(personId, relativeId);
    if (!mFather) {
      return false;
    }
    return true;
  }
  function kinshipGMM(personId, relativeId, kinshipType) {
    const mFather = validatoGMotherM(personId, relativeId, kinshipType);
    // const mkinship = kinshipSecondLevel(personId, relativeId, kinshipType);
    if (!mFather) {
      return false;
    }
    return true;
  }
  function kinshipGFF(personId, relativeId, kinshipType) {
    const mFather = validatoGFatherF(personId, relativeId, kinshipType);
    //const mkinship = kinshipSecondLevel(personId, relativeId, kinshipType);
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
  function kinshipGrandParents(personId, relativeId, kinshipType) {
    switch (kinshipType) {
      case "GFF":
        return kinshipGFF(personId, relativeId, "F");
      case "GFM":
        return kinshipGFM(personId, relativeId, "F");
      case "GMF":
        return kinshipGMF(personId, relativeId, "M");
      case "GMM":
        return kinshipGMM(personId, relativeId, "M");
      case "S":
        return kinshipS(personId, relativeId, "S");
        default:
        return kinshipModel.create({
          personId: personId,
          relativeId: relativeId,
          kinshipType: kinshipType
        });
    }
  }
  function transformKinship(kinshipTypeT) {
    switch (kinshipTypeT) {
      case "GFF":
        return (kinshipTypeT = "F");
      case "GFM":
        return (kinshipTypeT = "F");
      case "GMF":
        return (kinshipTypeT = "M");
      case "GMM":
        return (kinshipTypeT = "M");
      default:
        return kinshipTypeT;
    }
  }
  async function validateKinshipCreation(personId, relativeId, kinshipType) {
    const validation = await kinshipSecondLevel(
      personId,
      relativeId,
      kinshipType
    );
    if (validation) {
      return true;
    }
    return false;
  }
  return {
    validateKinshipCreation,
    searchSpace,
    kinshipGrandParents
  };
};
