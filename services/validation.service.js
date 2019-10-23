'use strict';

const constants = require('./constants');
const sequelize = require('sequelize');

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
    return result;
  }
  async function isValidPerson(personId) {
    const person = await personModel.findOne({ where: { id: personId } });
    return person !== null;
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
      where: { personId: personId, kinshipType: constants.motherKinshipType }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 2,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.motherKinshipType
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.motherKinshipType
      });
    }
    if (personObject != null) {
      const sameMother = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.motherKinshipType
        }
      });
      if (sameMother.relativeId != relativeId) {
        return false;
      }
      if (sameMother == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.motherKinshipType
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
      where: { personId: personId, kinshipType: constants.fatherKinshipType }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 2,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.fatherKinshipType
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.motherKinshipType
      });
    }
    if (personObject != null) {
      const sameMother = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.motherKinshipType
        }
      });
      if (sameMother == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.motherKinshipType
        });
      } else if (sameMother.relativeId != relativeId) {
        return false;
      }
    }
  }
  async function validatoGFatherM(personId, relativeId) {
    const personObject = await kinshipModel.findOne({
      where: { personId: personId, kinshipType: constants.motherKinshipType }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 1,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.motherKinshipType
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.fatherKinshipType
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.fatherKinshipType
        }
      });

      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.fatherKinshipType
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
      where: { personId: personId, kinshipType: constants.fatherKinshipType }
    });
    if (personObject == null) {
      const ghost = await personModel.create({
        genderId: 1,
        isGhost: 1
      });
      await kinshipModel.create({
        personId: personId,
        relativeId: ghost.id,
        kinshipType: constants.fatherKinshipType
      });
      await kinshipModel.create({
        personId: ghost.id,
        relativeId: relativeId,
        kinshipType: constants.fatherKinshipType
      });
    }
    if (personObject != null) {
      const sameFather = await kinshipModel.findOne({
        where: {
          personId: personObject.relativeId,
          kinshipType: constants.fatherKinshipType
        }
      });
      if (sameFather == null) {
        await kinshipModel.create({
          personId: personObject.relativeId,
          relativeId: relativeId,
          kinshipType: constants.fatherKinshipType
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
      await createKinship(
        relativeId,
        person.relativeId,
        constants.fatherKinshipType
      );
      await createKinship(
        relativeId,
        person2.relativeId,
        constants.motherKinshipType
      );
    } else if (person == null && person2 != null) {
      const ghostF = await createGhost(1);
      await createKinship(
        person2.personId,
        ghostF.id,
        constants.fatherKinshipType
      );
      await createKinship(relativeId, ghostF.id, constants.fatherKinshipType);
      await createKinship(relativeId, person2.relativeId, person2.kinshipType);
    } else {
      const ghostM = await createGhost(2);
      await createKinship(
        person2.personId,
        ghostM.id,
        constants.motherKinshipType
      );
      await createKinship(relativeId, ghostM.id, constants.motherKinshipType);
      await createKinship(
        relativeId,
        person2.relativeId,
        constants.fatherKinshipType
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
        kinshipType: constants.coupleKinshipType
      }
    });
    const kinship2 = await kinshipModel.findOne({
      where: {
        personId: personId,
        kinshipType: constants.coupleKinshipType
      }
    });
    const kinship3 = await kinshipModel.findOne({
      where: {
        relativeId: relativeId,
        kinshipType: constants.coupleKinshipType
      }
    });
    const kinship4 = await kinshipModel.findOne({
      where: {
        personId: relativeId,
        kinshipType: constants.coupleKinshipType
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
    const mAlreadyHasCouple = await alreadyHasCouple(personId, relativeId);
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
      kinshipType: constants.coupleKinshipType
    });
    await kinshipModel.create({
      personId: relativeId,
      relativeId: personId,
      kinshipType: constants.coupleKinshipType
    });
  }
  function createKinships(personId, relativeId, kinshipType) {
    switch (kinshipType) {
      case 'GFF':
        return kinshipGFF(personId, relativeId, 'F');
      case 'GFM':
        return kinshipGFM(personId, relativeId, 'F');
      case 'GMF':
        return kinshipGMF(personId, relativeId, 'M');
      case 'GMM':
        return kinshipGMM(personId, relativeId, 'M');
      case 'S':
        return kinshipS(personId, relativeId, 'S');
      case 'C':
        return kinshipC(personId, relativeId);
      default:
        return kinshipP(personId, relativeId, kinshipType);
    }
  }
  function modifyKinships(personId, relativeId, kinshipType) {
    switch (kinshipType) {
      case 'GFF':
        return kinshipGFF(personId, relativeId, 'F');
      case 'GFM':
        return kinshipGFM(personId, relativeId, 'F');
      case 'GMF':
        return kinshipGMF(personId, relativeId, 'M');
      case 'GMM':
        return kinshipGMM(personId, relativeId, 'M');
      case 'S':
        return kinshipS(personId, relativeId, 'S');
      case 'C':
        return kinshipC(personId, relativeId);
      default:
        return kinshipP(personId, relativeId, kinshipType);
    }
  }
  function transformKinship(kinshipTypeT) {
    switch (kinshipTypeT) {
      case 'GFF':
        return (kinshipTypeT = 'F');
      case 'GFM':
        return (kinshipTypeT = 'F');
      case 'GMF':
        return (kinshipTypeT = 'M');
      case 'GMM':
        return (kinshipTypeT = 'M');
      default:
        return kinshipTypeT;
    }
  }

  return {
    isValidPerson,
    kinshipValidations,
    createKinships,
    modifyKinships
  };
};
