'use strict';

const setupBaseService = require('./base.service');
const constants = require('./constants');

module.exports = function setupKinshipService(dependencies) {
  let baseService = new setupBaseService();
  const kinshipModel = dependencies.kinshipModel;
  const personModel = dependencies.personModel;
  const sharedService = dependencies.sharedService;

  //#region Helpers
  async function createKinship(kinship) {
    // Create couple kinship
    if (kinship.kinshipType === constants.coupleKinshipType.id) {
      await createCoupleKinship(kinship.personId, kinship.relativeId);
    }
    // Create father kinship
    else if (kinship.kinshipType === constants.fatherKinshipType.id) {
      await createFatherKinship(kinship.personId, kinship.relativeId);
    }
    // Create mother kinship
    else if (kinship.kinshipType === constants.motherKinshipType.id) {
      await createMotherKinship(kinship.personId, kinship.relativeId);
    }
    // Create sibling kinship
    else if (kinship.kinshipType === constants.siblingKinshipType.id) {
      await createSiblingKinship(kinship.personId, kinship.relativeId);
    }
    // Create paternal grandfather kinship
    else if (kinship.kinshipType === constants.paternalGrandfatherKinshipType.id) {
      await createPaternalGrandfatherKinship(kinship.personId, kinship.relativeId);
    }
    // Create paternal grandmother kinship
    else if (kinship.kinshipType === constants.paternalGrandmotherKinshipType.id) {
      await createPaternalGrandmotherKinship(kinship.personId, kinship.relativeId);
    }
    // Create maternal grandfather kinship
    else if (kinship.kinshipType === constants.maternalGrandfatherKinshipType.id) {
      await createMaternalGrandfatherKinship(kinship.personId, kinship.relativeId);
    }
    // Create maternal grandmother kinship
    else if (kinship.kinshipType === constants.maternalGrandmotherKinshipType.id) {
      await createMaternalGrandmotherKinship(kinship.personId, kinship.relativeId);
    }
  }

  async function createCoupleKinship(personId, relativeId) {
    // Check if there's a ghost couple kinship registered, and if so, update it and its counterpart
    const coupleKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.coupleKinshipType.id }
    });
    if (coupleKinship && coupleKinship.relative.isGhost) {
      const coupleKinshipCounterpart = await kinshipModel.findOne({
        where: { personId: coupleKinship.relativeId, relativeId: kinship.personId, kinshipType: constants.coupleKinshipType.id }
      });
      await kinshipModel.update({ relativeId }, { where: { id: coupleKinship.id } });
      await kinshipModel.update({ personId: relativeId }, { where: { id: coupleKinshipCounterpart.id } });
    }
    // Else, register the new couple kinship and its counterpart
    else {
      await kinshipModel.create({ personId, relativeId, kinshipType: constants.coupleKinshipType.id });
      await kinshipModel.create({ personId: relativeId, relativeId: personId, kinshipType: constants.coupleKinshipType.id });
    }
  }

  async function createFatherKinship(personId, relativeId) {
    // Check if there's a ghost father kinship registered
    const fatherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // If there's a ghost father, update that kinship and all the other kinships in which they are involved
    if (fatherKinship && fatherKinship.relative.isGhost) {
      await kinshipModel.update({ personId: relativeId }, { where: { personId: fatherKinship.relativeId } });
      await kinshipModel.update({ relativeId }, { where: { relativeId: fatherKinship.relativeId } });
    }
    // Else, a ghost mother has to be created along with the new father kinship
    else {
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      await kinshipModel.create({ personId, relativeId: ghostMother.id, kinshipType: constants.motherKinshipType.id });
      await kinshipModel.create({ personId, relativeId, kinshipType: constants.fatherKinshipType.id });
    }
  }

  async function createMaternalGrandfatherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Check if the person has a registered mother kinship
    const motherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    // If so, then save the id of that mother
    if (motherKinship) {
      motherId = motherKinship.relativeId;
    }
    // Else, we need a ghost mother
    else {
      // Create the ghost mother
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      // Save their id
      motherId = ghostMother.id;
      // Use the createMotherKinship method to register them as a mother, and also make sure to create a ghost father
      await createMotherKinship(personId, motherId);
    }
    // Use the createFatherKinship method to register the new grandfather as the father of the person's mother
    // It also makes sure that a ghost grandmother is created
    await createFatherKinship(motherId, relativeId);
  }

  async function createMaternalGrandmotherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Check if the person has a registered mother kinship
    const motherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    // If so, then save the id of that mother
    if (motherKinship) {
      motherId = motherKinship.relativeId;
    }
    // Else, we need a ghost mother
    else {
      // Create the ghost mother
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      // Save their id
      motherId = ghostMother.id;
      // Use the createMotherKinship method to register them as a mother, and also make sure to create a ghost father
      await createMotherKinship(personId, motherId);
    }
    // Use the createMotherKinship method again to register the new grandmother as the mother of the person's mother
    // It also makes sure that a ghost grandmother is created
    await createMotherKinship(motherId, relativeId);
  }

  async function createMotherKinship(personId, relativeId) {
    // Check if there's a ghost mother kinship registered
    const motherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    // If there's a ghost mother, update that kinship and all the other kinships in which they are involved
    if (motherKinship && motherKinship.relative.isGhost) {
      await kinshipModel.update({ personId: relativeId }, { where: { personId: motherKinship.relativeId } });
      await kinshipModel.update({ relativeId }, { where: { relativeId: motherKinship.relativeId } });
    }
    // Else, a ghost father has to be created along with the new mother kinship
    else {
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true });
      await kinshipModel.create({ personId, relativeId: ghostFather.id, kinshipType: constants.fatherKinshipType.id });
      await kinshipModel.create({ personId, relativeId, kinshipType: constants.motherKinshipType.id });
    }
  }

  async function createPaternalGrandfatherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Check if the person has a registered father kinship
    const fatherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // If so, then save the id of that father
    if (fatherKinship) {
      fatherId = fatherKinship.relativeId;
    }
    // Else, we need a ghost father
    else {
      // Create the ghost father
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true });
      // Save their id
      fatherId = ghostFather.id;
      // Use the createFatherKinship method to register them as a father, and also make sure to create a ghost mother
      await createFatherKinship(personId, fatherId);
    }
    // Use the createFatherKinship method again to register the new grandfather as the father of the person's father
    // It also makes sure that a ghost grandmother is created
    await createFatherKinship(fatherId, relativeId);
  }

  async function createPaternalGrandmotherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Check if the person has a registered father kinship
    const fatherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // If so, then save the id of that father
    if (fatherKinship) {
      fatherId = fatherKinship.relativeId;
    }
    // Else, we need a ghost father
    else {
      // Create the ghost father
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true });
      // Save their id
      fatherId = ghostFather.id;
      // Use the createFatherKinship method to register them as a father, and also make sure to create a ghost mother
      await createFatherKinship(personId, fatherId);
    }
    // Use the createMotherKinship method to register the new grandmother as the mother of the person's father
    // It also makes sure that a ghost grandfather is created
    await createMotherKinship(fatherId, relativeId);
  }

  async function createSiblingKinship(personId, relativeId) {
    // Declare temp variables to hold the parents ids that both people will share
    let fatherId;
    let motherId;
    // Check if there's a ghost father kinship registered
    const fatherKinship = await kinshipModel.findOne({
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // If there's a ghost father, then there's also a ghost mother
    if (fatherKinship) {
      // Get the ghost mother's kinship
      const motherKinship = await kinshipModel.findOne({
        where: { personId, kinshipType: constants.motherKinshipType.id }
      });
      // Save both parents ids
      fatherId = fatherKinship.relativeId;
      motherId = motherKinship.relativeId;
    }
    // If there's no ghost father, then new ghost parents need to be created
    else {
      // Create the ghost parents
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true });
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      // Save their ids
      fatherId = ghostFather.id;
      motherId = ghostMother.id;
      // Set both as parents of the person
      await kinshipModel.create({ personId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id });
      await kinshipModel.create({ personId, relativeId: motherId, kinshipType: constants.motherKinshipType.id });
    }
    // Finally, set the same parents ids to the new sibling
    await kinshipModel.create({ personId: relativeId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id });
    await kinshipModel.create({ personId: relativeId, relativeId: motherId, kinshipType: constants.motherKinshipType.id });
  }

  function getKinshipTypes() {
    return [
      constants.coupleKinshipType,
      constants.fatherKinshipType,
      constants.motherKinshipType,
      constants.siblingKinshipType,
      constants.paternalGrandfatherKinshipType,
      constants.paternalGrandmotherKinshipType,
      constants.maternalGrandfatherKinshipType,
      constants.maternalGrandmotherKinshipType
    ];
  }
  //#endregion

  async function create(kinship) {
    try {
      let errors = [];
      // Validate kinship data
      await sharedService.validateKinshipData(kinship, errors);
      if (errors.length > 0) {
        return baseService.getServiceResponse(400, errors.join('\n'), {});
      }
      // Validate kinship gender
      await sharedService.validateKinshipGender(kinship, errors);
      if (errors.length > 0) {
        return baseService.getServiceResponse(400, errors.join('\n'), {});
      }
      // Validate family tree
      await sharedService.validateFamilyTree(kinship, errors);
      if (errors.length > 0) {
        return baseService.getServiceResponse(400, errors.join('\n'), {});
      }
      // If no errors were found, create the kinship
      await createKinship(kinship);
      return baseService.getServiceResponse(200, 'Success', {});
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function doListTypes() {
    try {
      const kinshipTypes = getKinshipTypes();
      return baseService.getServiceResponse(200, 'Success', kinshipTypes);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doListTypes,
    create
  };
};
