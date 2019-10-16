"use strict";

const constants = require('./constants');
const sequelize = require('sequelize');
const Op=sequelize.Op;


module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;

  function getRootParentsRecursive(kinships, personId) {
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType);
    /*const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType);*/
    

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

  async function isSameGenderCouple(personId, relativeId, kinshipType) {

    const person1 = await personModel.findOne({ where: {id: personId } });
    const person2 = await personModel.findOne({ where: {id: relativeId } });
    console.log('ok2');
    if (kinshipType == constants.coupleKinshipType) {
      if (person1.genderId === person2.genderId) {
        return true;
      } else {
        return false;
      }
    }
    return false;
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

  function isValidGenderForKinshipType(genderId, kinshipType) {
    return (
      (genderId === 1 && kinshipType === "F") ||
      (genderId === 2 && kinshipType === "M") ||
      (genderId === 1 && kinshipType === "B") ||
      (genderId === 2 && kinshipType === "S") ||
      (genderId === 1 && kinshipType === "GF") ||
      (genderId === 2 && kinshipType === "GM") ||
      ((genderId === 1 || genderId === 2) && kinshipType === "C")
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
  }
   async function isSameGenderCouple(personId, relativeId, kinshipType){
     const person = await personModel.findOne({ where: { id: personId } });
     console.log(person.genderId); 
   }
   */
  async function getYear(person){
    const PersonObject = await personModel.findOne({ where: { id: person } })
   
    var DatePerson = new Date(PersonObject.birthdate)
   
    const year = DatePerson.getFullYear();
   return year;

  }

/*Validación de comparación de edades entre parientes*/
async function validatoGFather(personId,GfatherId){
  
  const PersonObject = await kinshipModel.findOne({ where: {personId: personId, kinshipType:'F'} });
const idpadre = PersonObject.relativeId;

await kinshipModel.create({personId: idpadre,relativeId:GfatherId,kinshipType:'F'});

if(PersonObject != null){
  console.log('todo bien')

}
}

   async function isOlderThanParents(personId,relativeId,kinshipType){
   console.log(await getYear(personId))
   console.log(await getYear(relativeId))
   if(await getYear(personId) - awagetYear(relativeId) > 15){/*Si la diferencia es mayor a 15 */
    console.log('aqui estoy');
    return true

   }
   return false }
  
   
  async function validateKinshipCreation(personId, relativeId, kinshipType) {
    // Validate given data
    
    const mIsValidPerson = await isValidPerson(personId);
    const mIsValidRelative = await isValidPerson(relativeId);
    const mIsValidKinshipType = isValidKinshipType(kinshipType);
    const prueba = validatoGFather(personId,relativeId);
   // const mKinshipAlreadyExists = kinshipAlreadyExists(personId, relativeId);
    //const mIsSameGenderCouple = await isSameGenderCouple(personId, relativeId, kinshipType);
   // const mIsOlderThanParents = await isOlderThanParents(personId, relativeId, kinshipType);
    
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