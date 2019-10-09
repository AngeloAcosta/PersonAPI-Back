"use strict";

const constants = require("./constants");

module.exports = function setupValidationService(models) {
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;

  function findUpwardsRecursive(kinships, personId, relativeId) {
    const personKinships = kinships.filter(k => k.personId === personId && 
      (k.kinshipType === constants.fatherKinshipType || k.kinshipType === constants.motherKinshipType));
    
  }

  function isUpwardsInTree(personId, relativeId) {
    const kinships = await kinshipModel.findAll();
    if (personKinships.length > 0) {
      return findUpwardsRecursive(kinships, personId, relativeId);
    } else {
      return false;
    }
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

  async function kinshipAlreadyExists(personId, relativeId, kinshipType) {
    const kinship = await kinshipModel.findOne({ where: { personId, relativeId } })
    return kinship !== null;
  }

  async function validateKinshipCreation(personId, relativeId, kinshipType) {
     switch(kinshipType){
         case constants.fatherKinshipType:
            await validateSameGenderParents(personId,relativeId);
             break;
         case 'M':
             
         break;
         case 'C':
             validateSameGenderCouple(personId,relativeId);
        break;
     }
  }

  return {
    validateAll
  };
};
