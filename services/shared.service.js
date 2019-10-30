'use strict';

const Sequelize = require('sequelize');
const constants = require('./constants');
const setupBaseService = require('./base.service');

const Op = Sequelize.Op;

module.exports = function setupSharedService(models) {
  let baseService = new setupBaseService();
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;

  //#region Helpers
  async function confirmCreateKinship(kinship) {
    switch (kinship.kinshipType) {
      // Create couple kinship
      case constants.coupleKinshipType.id:
        await createCoupleKinship(kinship.personId, kinship.relativeId);
        break;
      // Create father kinship
      case constants.fatherKinshipType.id:
        await createFatherKinship(kinship.personId, kinship.relativeId);
        break;
      // Create mother kinship
      case constants.motherKinshipType.id:
        await createMotherKinship(kinship.personId, kinship.relativeId);
        break;
      // Create sibling kinship
      case constants.siblingKinshipType.id:
        await createSiblingKinship(kinship.personId, kinship.relativeId);
        break;
      // Create paternal grandfather kinship
      case constants.paternalGrandfatherKinshipType.id:
        await createPaternalGrandfatherKinship(kinship.personId, kinship.relativeId);
        break;
      // Create paternal grandmother kinship
      case constants.paternalGrandmotherKinshipType.id:
        await createPaternalGrandmotherKinship(kinship.personId, kinship.relativeId);
        break;
      // Create maternal grandfather kinship
      case constants.maternalGrandfatherKinshipType.id:
        await createMaternalGrandfatherKinship(kinship.personId, kinship.relativeId);
        break;
      // Create maternal grandmother kinship
      case constants.maternalGrandmotherKinshipType.id:
        await createMaternalGrandmotherKinship(kinship.personId, kinship.relativeId);
        break;
    }
  }

  async function confirmDeleteKinship(kinship) {
    switch (kinship.kinshipType) {
      // Delete couple kinship
      case constants.coupleKinshipType.id:
        await deleteCoupleKinship(kinship.personId, kinship.relativeId);
        break;
      // Delete father kinship
      case constants.fatherKinshipType.id:
        await deleteFatherKinship(kinship.personId, kinship.relativeId);
        break;
      // Delete mother kinship  
      case constants.motherKinshipType.id:
        await deleteMotherKinship(kinship.personId, kinship.relativeId);
        break;
      // Delete sibling kinship
      case constants.siblingKinshipType.id:
        await deleteSiblingKinship(kinship.personId, kinship.relativeId);
        break;
      // Delete paternal grandfather kinship
      case constants.paternalGrandfatherKinshipType.id:
        await deletePaternalGrandfatherKinship(kinship.personId, kinship.relativeId);
        break;
      // Delete paternal grandmother kinship
      case constants.paternalGrandmotherKinshipType.id:
        await deletePaternalGrandmotherKinship(kinship.personId, kinship.relativeId);
        break;
      // Delete maternal grandfather kinship
      case constants.maternalGrandfatherKinshipType.id:
        await deleteMaternalGrandfatherKinship(kinship.personId, kinship.relativeId);
        break;
      // Delete maternal grandmother kinship
      case constants.maternalGrandmotherKinshipType.id:
        await deleteMaternalGrandmotherKinship(kinship.personId, kinship.relativeId);
        break;
    }
  }
  async function createCoupleKinship(personId, relativeId) {
    // Check if there's a couple kinship registered, and if so, update it and its counterpart
    const coupleKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.coupleKinshipType.id }
    });
    if (coupleKinship) {
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
    // Check if there's a father kinship registered
    const fatherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // If there's a father kinship, update that kinship and all the other kinships in which they are involved
    if (fatherKinship) {
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
      include: { all: true },
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
      include: { all: true },
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
    // Check if there's a mother kinship registered
    const motherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    // If there's a mother, update that kinship and all the other kinships in which they are involved
    if (motherKinship) {
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
      include: { all: true },
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
      include: { all: true },
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
    // Declare temp variables to hold the parents
    let fatherId;
    let motherId;
    // Check if there's a father kinship registered
    const fatherKinship = await kinshipModel.findOne({
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // If there's a father kinship, then there's also a mother kinship
    if (fatherKinship) {
      // Get the mother's kinship
      const motherKinship = await kinshipModel.findOne({
        where: { personId, kinshipType: constants.motherKinshipType.id }
      });
      // Save both parents ids
      fatherId = fatherKinship.relativeId;
      motherId = motherKinship.relativeId;
    }
    // Else, new ghost parents need to be created
    else {
      // Create the ghost parents
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true });
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      // Save both parents ids
      fatherId = ghostFather.id;
      motherId = ghostMother.id;
      // Set both as parents of the person
      await kinshipModel.create({ personId, relativeId: ghostFather.id, kinshipType: constants.fatherKinshipType.id });
      await kinshipModel.create({ personId, relativeId: ghostMother.id, kinshipType: constants.motherKinshipType.id });
    }
    // Check if the new sibling has parents kinships, by looking only for an existent father kinship
    const relativeFatherKinship = await kinshipModel.findOne({
      where: { personId: relativeId, kinshipType: constants.fatherKinshipType.id }
    });
    // If such kinships exist, update them
    if (relativeFatherKinship) {
      await kinshipModel.update({ relativeId: fatherId }, { where: { personId: relativeId, kinshipType: constants.fatherKinshipType.id } });
      await kinshipModel.update({ relativeId: motherId }, { where: { personId: relativeId, kinshipType: constants.motherKinshipType.id } });
    }
    // Else, create them
    else {
      await kinshipModel.create({ personId: relativeId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id });
      await kinshipModel.create({ personId: relativeId, relativeId: motherId, kinshipType: constants.motherKinshipType.id });
    }
  }

  async function deleteCoupleKinship(personId, relativeId) {

    await kinshipModel.destroy(
      { where: { personId, kinshipType: constants.coupleKinshipType.id, relativeId } 
    });
}

  async function deleteFatherKinship(personId, relativeId) {
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true, isDeleted: false });

      await kinshipModel.update(
        { relativeId: ghostFather.id}, 
        { where: { personId, kinshipType: constants.fatherKinshipType.id, relativeId } 
      });
  }

  async function deleteMotherKinship(personId, relativeId) {
    const ghostMother = await personModel.create({ genderId: 2, isGhost: true, isDeleted: false });
    
    await kinshipModel.update(
      { relativeId: ghostMother.id}, 
      { where: { personId, kinshipType: constants.motherKinshipType.id, relativeId } 
    });
  }

  async function deleteSiblingKinship(personId, relativeId) {
    // Declare temp variables to hold the parents
    let fatherId;
    let motherId;
    // Get the father's kinship
    const fatherKinship = await kinshipModel.findOne({
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // Get the mother's kinship
    const motherKinship = await kinshipModel.findOne({
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    // Save both parents ids
    fatherId = fatherKinship.relativeId;
    motherId = motherKinship.relativeId;
    // Assign parent ghosts for the sibling
    await deleteFatherKinship(relativeId, fatherId);
    await deleteMotherKinship(relativeId, motherId);
  }

  async function deletePaternalGrandfatherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Get the father kinship
    const fatherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // Save the id of that father
    fatherId = fatherKinship.relativeId;
    
    // Assign father ghost for the father
    await deleteFatherKinship(fatherId, relativeId);
  }

  async function deletePaternalGrandmotherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Get the father kinship
    const fatherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // Save the id of that father
    fatherId = fatherKinship.relativeId;
    
    // Assign mother ghost for the father
    await deleteMotherKinship(fatherId, relativeId);
  }

  async function deleteMaternalGrandfatherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Get the mother kinship
    const motherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    // Save the id of that mother
    motherId = motherKinship.relativeId;
    
    // Assign father ghost for the mother
    await deleteFatherKinship(motherId, relativeId);
  }

  async function deleteMaternalGrandmotherKinship(personId, relativeId) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Get the mother kinship
    const motherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    // Save the id of that mother
    motherId = motherKinship.relativeId;
    
    // Assign father ghost for the mother
    await deleteMotherKinship(motherId, relativeId);
  }

  async function getCouple(personId) {
    const coupleKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.coupleKinshipType.id }
    });
    return coupleKinship && coupleKinship.relative;
  }

  function getKinshipTypeIds() {
    return [
      constants.coupleKinshipType.id,
      constants.fatherKinshipType.id,
      constants.motherKinshipType.id,
      constants.siblingKinshipType.id,
      constants.paternalGrandfatherKinshipType.id,
      constants.paternalGrandmotherKinshipType.id,
      constants.maternalGrandfatherKinshipType.id,
      constants.maternalGrandmotherKinshipType.id
    ];
  }

  async function getFather(personId) {
    const fatherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    return fatherKinship && fatherKinship.relative;
  }

  async function getMother(personId) {
    const motherKinship = await kinshipModel.findOne({
      include: { all: true },
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    return motherKinship && motherKinship.relative;
  }

  async function getPersonKinships(person) {
    const kinships = [];
    // Get and attach couple
    const couple = await getCouple(person.id);
    if (couple && !couple.isGhost) {
      kinships.push(getSimpleKinshipModel(person, couple, constants.coupleKinshipType));
    }
    // Get father
    const father = await getFather(person.id);
    // If there is at least a father, then the person has a tree...
    if (father) {
      // Attach father
      if (!father.isGhost) {
        kinships.push(getSimpleKinshipModel(person, father, constants.fatherKinshipType));
      }
      // Get and attach mother
      const mother = await getMother(person.id);
      if (mother && !mother.isGhost) {
        kinships.push(getSimpleKinshipModel(person, mother, constants.motherKinshipType));
      }
      // Get and attach siblings
      const siblings = await getSiblings(person.id, father.id);
      siblings.forEach(s => {
        if (s && !s.isGhost) {
          kinships.push(getSimpleKinshipModel(person, s, constants.siblingKinshipType));
        }
      });
      // Get and attach paternal grandfather
      const paternalGrandfather = await getFather(father.id);
      if (paternalGrandfather && !paternalGrandfather.isGhost) {
        kinships.push(getSimpleKinshipModel(person, paternalGrandfather, constants.paternalGrandfatherKinshipType));
      }
      // Get and attach paternal grandmother
      const paternalGrandmother = await getMother(father.id);
      if (paternalGrandmother && !paternalGrandmother.isGhost) {
        kinships.push(getSimpleKinshipModel(person, paternalGrandmother, constants.paternalGrandmotherKinshipType));
      }
      // Get and attach maternal grandfather
      const maternalGrandfather = await getFather(mother.id);
      if (maternalGrandfather && !maternalGrandfather.isGhost) {
        kinships.push(getSimpleKinshipModel(person, maternalGrandfather, constants.maternalGrandfatherKinshipType));
      }
      // Get and attach maternal grandmother
      const maternalGrandmother = await getMother(mother.id);
      if (maternalGrandmother && !maternalGrandmother.isGhost) {
        kinships.push(getSimpleKinshipModel(person, maternalGrandmother, constants.maternalGrandmotherKinshipType));
      }
    }
    return kinships;
  }

  async function getSiblings(id, fatherId) {
    const siblingKinships = await kinshipModel.findAll({
      include: { all: true },
      where: {
        personId: {
          [Op.ne]: id
        },
        relativeId: fatherId,
        kinshipType: constants.fatherKinshipType.id
      }
    });
    return siblingKinships.map(sK => (sK.person));
  }

  function getSimpleKinshipModel(person, relative, kinshipType) {
    return {
      personId: person.id,
      personName: person.name,
      personLastName: person.lastName,
      relativeId: relative.id,
      relativeName: relative.name,
      relativeLastName: relative.lastName,
      kinshipTypeId: kinshipType.id,
      kinshipType: kinshipType.name
    };
  }

  async function testCreateCoupleKinship(personId, relativeId, kinships) {
    // Check if there's a couple kinship registered, and if so, update it and its counterpart
    const coupleKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.coupleKinshipType.id);
    if (coupleKinship) {
      const coupleKinshipCounterpart = kinships.find(k => k.personId === coupleKinship.relativeId && k.relativeId === personId && k.kinshipType === constants.coupleKinshipType.id);
      coupleKinship.relativeId = relativeId;
      coupleKinshipCounterpart.personId = relativeId;
    }
    // Else, register the new couple kinship and its counterpart
    else {
      kinships.push({ personId, relativeId, kinshipType: constants.coupleKinshipType.id });
      kinships.push({ personId: relativeId, relativeId: personId, kinshipType: constants.coupleKinshipType.id });
    }
  }

  async function testCreateFatherKinship(personId, relativeId, kinships) {
    // Check if there's a father kinship registered
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there's a father kinship, update that kinship and all the other kinships in which they are involved
    if (fatherKinship) {
      fatherKinship.personId = personId;
      kinships
        .filter(k => k.personId === fatherKinship.relativeId)
        .forEach(k => k.personId = relativeId);
      kinships
        .filter(k => k.relativeId === fatherKinship.relativeId)
        .forEach(k => k.relativeId = relativeId);
    }
    // Else, a ghost mother has to be created along with the new father kinship
    else {
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      kinships.push({ personId, relativeId: ghostMother.id, kinshipType: constants.motherKinshipType.id });
      kinships.push({ personId, relativeId, kinshipType: constants.fatherKinshipType.id });
    }
  }

  async function testCreateKinship(kinship) {
    // Get all kinships into a test array
    const kinships = await kinshipModel.findAll();
    // Get tree using test array
    const currentTree = await getComparingTree(kinship.personId, kinships);
    // Update test kinships array
    await updateTestKinships(kinship, kinships);
    // Get updated tree using test array
    const updatedTree = await getComparingTree(kinship.personId, kinships);
    // Compare trees and return the result
    return getTreesComparingResult(currentTree, updatedTree);
  }

  async function testCreateMaternalGrandfatherKinship(personId, relativeId, kinships) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Check if the person has a registered mother kinship
    const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
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
      // Use the testCreateMotherKinship method to register them as a mother, and also make sure to create a ghost father
      await testCreateMotherKinship(personId, motherId, kinships);
    }
    // Use the testCreateFatherKinship method to register the new grandfather as the father of the person's mother
    // It also makes sure that a ghost grandmother is created
    await testCreateFatherKinship(motherId, relativeId, kinships);
  }

  async function testCreateMaternalGrandmotherKinship(personId, relativeId, kinships) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Check if the person has a registered mother kinship
    const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
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
      // Use the testCreateMotherKinship method to register them as a mother, and also make sure to create a ghost father
      await testCreateMotherKinship(personId, motherId, kinships);
    }
    // Use the testCreateMotherKinship method again to register the new grandmother as the mother of the person's mother
    // It also makes sure that a ghost grandfather is created
    await testCreateMotherKinship(motherId, relativeId, kinships);
  }

  async function testCreateMotherKinship(personId, relativeId, kinships) {
    // Check if there's a mother kinship registered
    const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
    // If there's a mother kinship, update that kinship and all the other kinships in which they are involved
    if (motherKinship) {
      motherKinship.personId = personId;
      kinships
        .filter(k => k.personId === motherKinship.relativeId)
        .forEach(k => k.personId = relativeId);
      kinships
        .filter(k => k.relativeId === motherKinship.relativeId)
        .forEach(k => k.relativeId = relativeId);
    }
    // Else, a ghost father has to be created along with the new father kinship
    else {
      const ghostFather = await personModel.create({ genderId: 2, isGhost: true });
      kinships.push({ personId, relativeId: ghostFather.id, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId, relativeId, kinshipType: constants.motherKinshipType.id });
    }
  }

  async function testCreatePaternalGrandfatherKinship(personId, relativeId, kinships) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Check if the person has a registered father kinship
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
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
      // Use the testCreateFatherKinship method to register them as a father, and also make sure to create a ghost mother
      await testCreateFatherKinship(personId, fatherId, kinships);
    }
    // Use the testCreateFatherKinship method again to register the new grandfather as the father of the person's father
    // It also makes sure that a ghost grandmother is created
    await testCreateFatherKinship(fatherId, relativeId, kinships);
  }

  async function testCreatePaternalGrandmotherKinship(personId, relativeId, kinships) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Check if the person has a registered father kinship
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
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
      // Use the testCreateFatherKinship method to register them as a father, and also make sure to create a ghost mother
      await testCreateFatherKinship(personId, fatherId, kinships);
    }
    // Use the testCreateMotherKinship method to register the new grandmother as the mother of the person's father
    // It also makes sure that a ghost grandfather is created
    await testCreateMotherKinship(fatherId, relativeId, kinships);
  }

  async function testCreateSiblingKinship(personId, relativeId, kinships) {
    // Declare temp variables to hold the parents ids
    let fatherId;
    let motherId;
    // Check if there's a father kinship registered
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there's a father kinship, then there's also a mother kinship
    if (fatherKinship) {
      // Get the mother's kinship
      const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
      // Save both parents
      fatherId = fatherKinship.relative;
      motherId = motherKinship.relative;
    }
    // Else, new ghost parents need to be created
    else {
      // Create the ghost parents
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true });
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      // Save both parents
      fatherId = ghostFather.id;
      motherId = ghostMother.id;
      // Set both as parents of the person
      kinships.push({ personId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId, relativeId: motherId, kinshipType: constants.motherKinshipType.id });
    }
    // Check if the new sibling has parents kinships, by looking only for an existent father kinship
    const relativeFatherKinship = kinships.find(k => k.personId === relativeId && k.kinshipType === constants.fatherKinshipType.id);
    // If such kinships exist, update them
    if (relativeFatherKinship) {
      relativeFatherKinship.relativeId = father.id;
      const relativeMotherKinship = kinships.find(k => k.personId === relativeId && k.kinshipType === constants.motherKinshipType.id);
      relativeMotherKinship.relativeId = mother.id;
    }
    // Else, create them
    else {
      kinships.push({ personId: relativeId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId: relativeId, relativeId: motherId, kinshipType: constants.motherKinshipType.id });
    }
  }

  async function updateTestKinships(kinship, kinships) {
    switch (kinship.kinshipType) {
      // Create couple kinship
      case constants.coupleKinshipType.id:
        await testCreateCoupleKinship(kinship.personId, kinship.relativeId, kinships);
        break;
      // Create father kinship
      case constants.fatherKinshipType.id:
        await testCreateFatherKinship(kinship.personId, kinship.relativeId, kinships);
        break;
      // Create mother kinship
      case constants.motherKinshipType.id:
        await testCreateMotherKinship(kinship.personId, kinship.relativeId, kinships);
        break;
      // Create sibling kinship
      case constants.siblingKinshipType.id:
        await testCreateSiblingKinship(kinship.personId, kinship.relativeId, kinships);
        break;
      // Create paternal grandfather kinship
      case constants.paternalGrandfatherKinshipType.id:
        await testCreatePaternalGrandfatherKinship(kinship.personId, kinship.relativeId, kinships);
        break;
      // Create paternal grandmother kinship
      case constants.paternalGrandmotherKinshipType.id:
        await testCreatePaternalGrandmotherKinship(kinship.personId, kinship.relativeId, kinships);
        break;
      // Create maternal grandfather kinship
      case constants.maternalGrandfatherKinshipType.id:
        await testCreateMaternalGrandfatherKinship(kinship.personId, kinship.relativeId, kinships);
        break;
      // Create maternal grandmother kinship
      case constants.maternalGrandmotherKinshipType.id:
        await testCreateMaternalGrandmotherKinship(kinship.personId, kinship.relativeId, kinships);
        break;
    }
  }
  //#endregion

  //#region Tree TODO: Maybe move this to its own service
  function doSimpleTreeNodeCompare(currentTreeNode, updatedTreeNode, kinshipName, testResults) {
    if (currentTreeNode) {
      if (!updatedTreeNode) {
        // Deleted
        testResults.deleted.push(getDeletedComparingResult(currentTreeNode, kinshipName));
      } else if (currentTreeNode.id !== updatedTreeNode.id) {
        // Modified
        testResults.modified.push(getModifiedComparingResult(currentTreeNode, updatedTreeNode, kinshipName));
      }
    } else if (updatedTreeNode) {
      // Added
      testResults.added.push(getAddedComparingResult(updatedTreeNode, kinshipName));
    }
  }

  function getAddedComparingResult(relative, kinshipTypeName) {
    return `${kinshipTypeName} kinship with ${relative.name} ${relative.lastName} will be added`;
  }

  async function getComparingTree(personId, kinships) {
    const tree = {
      couple: null,
      father: null,
      mother: null,
      siblings: [],
      paternalGrandfather: null,
      paternalGrandmother: null,
      maternalGrandfather: null,
      maternalGrandmother: null
    };
    // Get and attach couple
    const coupleKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.coupleKinshipType.id);
    if (coupleKinship) {
      tree.couple = await personModel.findOne({ where: { id: coupleKinship.relativeId, isGhost: false } });
    }
    // Get (ghost) father
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there is at least a (ghost) father, then the person has a tree...
    if (fatherKinship) {
      // Attach father
      tree.father = await personModel.findOne({ where: { id: fatherKinship.relativeId, isGhost: false } });
      // Get and attach mother
      const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
      if (motherKinship) {
        tree.mother = await personModel.findOne({ where: { id: motherKinship.relativeId, isGhost: false } });
      }
      // Get and attach siblings
      const siblingKinships = kinships.filter(k => k.personId !== personId && k.relativeId === fatherKinship.relativeId && k.kinshipType === constants.fatherKinshipType.id);
      for (let index = 0; index < siblingKinships.length; index++) {
        const k = siblingKinships[index];
        const sibling = await personModel.findOne({ where: { id: k.personId, isGhost: false } });
        if (sibling) {
          tree.siblings.push(sibling);
        }
      }
      // Get and attach paternal grandfather
      const paternalGrandfatherKinship = kinships.find(k => k.personId === fatherKinship.relativeId && k.kinshipType === constants.fatherKinshipType.id);
      if (paternalGrandfatherKinship) {
        tree.paternalGrandfather = await personModel.findOne({ where: { id: paternalGrandfatherKinship.relativeId, isGhost: false } });
      }
      // Get and attach paternal grandmother
      const paternalGrandmotherKinship = kinships.find(k => k.personId === fatherKinship.relativeId && k.kinshipType === constants.motherKinshipType.id);
      if (paternalGrandmotherKinship) {
        tree.paternalGrandmother = await personModel.findOne({ where: { id: paternalGrandmotherKinship.relativeId, isGhost: false } });
      }
      // Get and attach maternal grandfather
      const maternalGrandfatherKinship = kinships.find(k => k.personId === motherKinship.relativeId && k.kinshipType === constants.fatherKinshipType.id);
      if (maternalGrandfatherKinship) {
        tree.maternalGrandfather = await personModel.findOne({ where: { id: maternalGrandfatherKinship.relativeId, isGhost: false } });
      }
      // Get and attach maternal grandmother
      const maternalGrandmotherKinship = kinships.find(k => k.personId === motherKinship.relativeId && k.kinshipType === constants.motherKinshipType.id);
      if (maternalGrandmotherKinship) {
        tree.maternalGrandmother = await personModel.findOne({ where: { id: maternalGrandmotherKinship.relativeId, isGhost: false } });
      }
    }
    return tree;
  }

  function getDeletedComparingResult(relative, kinshipTypeName) {
    return `${kinshipTypeName} kinship with ${relative.name} ${relative.lastName} will be deleted`;
  }

  function getModifiedComparingResult(oldRelative, newRelative, kinshipTypeName) {
    return `${kinshipTypeName} kinship with ${oldRelative.name} ${oldRelative.lastName} will be modified to ${newRelative.name} ${newRelative.lastName}`;
  }

  function getTreesComparingResult(currentTree, updatedTree) {
    const testResults = {
      added: [],
      modified: [],
      deleted: []
    };
    // Compare couples
    doSimpleTreeNodeCompare(currentTree.couple, updatedTree.couple, constants.coupleKinshipType.name, testResults);
    // Compare fathers
    doSimpleTreeNodeCompare(currentTree.father, updatedTree.father, constants.fatherKinshipType.name, testResults);
    // Compare mothers
    doSimpleTreeNodeCompare(currentTree.mother, updatedTree.mother, constants.motherKinshipType.name, testResults);
    // Compare siblings
    updatedTree.siblings // Added
      .filter(s => !currentTree.siblings.includes(s))
      .forEach(s => testResults.added.push(getAddedComparingResult(s, constants.siblingKinshipType.name)));
    currentTree.siblings // Deleted
      .filter(s => !updatedTree.siblings.includes(s))
      .forEach(s => testResults.deleted.push(getDeletedComparingResult(s, constants.siblingKinshipType.name)));
    // Compare paternal grandfathers
    doSimpleTreeNodeCompare(currentTree.paternalGrandfather, updatedTree.paternalGrandfather, constants.paternalGrandfatherKinshipType.name, testResults);
    // Compare paternal grandmothers
    doSimpleTreeNodeCompare(currentTree.paternalGrandmother, updatedTree.paternalGrandmother, constants.paternalGrandmotherKinshipType.name, testResults);
    // Compare maternal grandfathers
    doSimpleTreeNodeCompare(currentTree.maternalGrandfather, updatedTree.maternalGrandfather, constants.maternalGrandfatherKinshipType.name, testResults);
    // Compare maternal grandfathers
    doSimpleTreeNodeCompare(currentTree.maternalGrandmother, updatedTree.maternalGrandmother, constants.maternalGrandmotherKinshipType.name, testResults);
    // Return the test results
    return testResults;
  }
  //#endregion

  //#region Validators
  async function validateExistingRelationship(kinship, errors) {
    // Assuming that the personId and the relativeId are valid
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    const personKinships = await getPersonKinships(person);
    const relativeKinships = await getPersonKinships(relative);
    if (personKinships.some(k => k.relativeId === relative.id) || relativeKinships.some(k => k.relativeId === person.id)) {
      errors.push('The person and the relative are already related');
    }
  }

  async function validateKinshipExists(kinship, errors) {
    // Assuming that the personId and the relativeId are valid
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    const personKinships = await getPersonKinships(person);
    const relativeKinships = await getPersonKinships(relative);
    if (personKinships.some(k => k.relativeId === relative.id) || relativeKinships.some(k => k.relativeId === person.id)) {
      
    } else {
      errors.push('This relationship does not exist');
    }
  }

  async function validateKinshipCreate(kinship, errors) {
    // Validate kinship data
    await validateKinshipData(kinship, errors);
    if (errors.length > 0) {
      return;
    }
    // Validate kinship gender
    await validateKinshipGender(kinship, errors);
    if (errors.length > 0) {
      return;
    }
    // Validate existing relationship
    await validateExistingRelationship(kinship, errors);
    if (errors.length > 0) {
      return;
    }
  }

  async function validateKinship(kinship, errors) {
    // Validate kinship data
    await validateKinshipData(kinship, errors);
    if (errors.length > 0) {
      return;
    }
    
    // Validate existing relationship
    await validateKinshipExists(kinship, errors);
    if (errors.length > 0) {
      return;
    }
  }
  

  async function validateKinshipData(kinship, errors) {
    // Validate person
    if (!kinship.personId) {
      errors.push('The person id is required');
    } else {
      const person = await personModel.findOne({ where: { id: kinship.personId, isGhost: false } });
      if (!person) {
        errors.push('Invalid submitted person');
      }
    }
    // Validate relative
    if (!kinship.relativeId) {
      errors.push('The relative id is required');
    } else if (kinship.personId === kinship.relativeId) {
      errors.push('The relative can\'t be the same as the person');
    } else {
      const relative = await personModel.findOne({ where: { id: kinship.relativeId, isGhost: false } });
      if (!relative) {
        errors.push('Invalid submitted relative');
      }
    }
    // Validate kinship type
    if (!getKinshipTypeIds().includes(kinship.kinshipType)) {
      errors.push('Invalid submitted kinship type');
    }
  }

  async function validateKinshipGender(kinship, errors) {
    // Assuming that the personId, the relativeId and the kinshipType are valid
    const maleKinshipTypes = [
      constants.fatherKinshipType.id,
      constants.paternalGrandfatherKinshipType.id,
      constants.maternalGrandfatherKinshipType.id
    ];
    const femaleKinshipTypes = [
      constants.motherKinshipType.id,
      constants.paternalGrandmotherKinshipType.id,
      constants.maternalGrandmotherKinshipType.id
    ];
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    if (maleKinshipTypes.includes(kinship.kinshipType) && relative.genderId === 2) {
      errors.push('The relative must be a male');
    } else if (femaleKinshipTypes.includes(kinship.kinshipType) && relative.genderId === 1) {
      errors.push('The relative must be a female');
    } else if (kinship.kinshipType === constants.coupleKinshipType.id && person.genderId === relative.genderId) {
      errors.push('The person and the relative must not have the same gender');
    }
  }
  //#endregion

  async function createPersonKinship(kinship) {
    // Validate creation
    const errors = [];
    await validateKinshipCreate(kinship, errors);
    // If errors were gound, return 400
    if (errors.length > 0) {
      return baseService.getServiceResponse(400, errors.join('\n'), {});
    }
    // Else, create the kinship
    await confirmCreateKinship(kinship);
    // And return 200
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function createPersonKinshipTest(kinship) {
    // Validate creation
    const errors = [];
    await validateKinshipCreate(kinship, errors);
    // If errors were gound, return 400
    if (errors.length > 0) {
      return baseService.getServiceResponse(400, errors.join('\n'), {});
    }
    // Else, test the kinship creation
    const personData = await testCreateKinship(kinship);
    // And return 200
    return baseService.getServiceResponse(200, 'Success', personData);
  }

  async function doListKinships(query) {
    // Find all people that satisfy the query
    const whereClause = { [Op.like]: `%${query}%` };
    const people = await personModel.findAll({
      where: { [Op.or]: [{ name: whereClause }, { lastName: whereClause }], isGhost: false }
    });
    // Find and concatenate the kinships of each person
    let kinships = [];
    for (let index = 0; index < people.length; index++) {
      const person = people[index];
      const personKinships = await getPersonKinships(person);
      kinships = kinships.concat(personKinships);
    }
    // Return 200
    return baseService.getServiceResponse(200, 'Success', kinships);
  }

  async function doListPersonKinships(personId) {
    // Get the person
    const person = await personModel.findOne({ where: { id: personId, isGhost: false } });
    // If the person doesn't exist, return 404
    if (!person) {
      return baseService.getServiceResponse(404, 'Not found', []);
    }
    // Else, get their kinships
    const kinships = await getPersonKinships(person);
    // Return 200
    return baseService.getServiceResponse(200, 'Success', kinships);
  }
  
  async function deletePersonKinship(kinship){
    // Validate kinship
    const errors = [];
    await validateKinship(kinship, errors);
    // If errors were found, return 400
    if (errors.length > 0) {
      return baseService.getServiceResponse(400, errors.join('\n'), {});
    }
    await confirmDeleteKinship(kinship);
    // And return 200
    return baseService.getServiceResponse(200, 'Success', {});

  }

  return {
    createPersonKinship,
    createPersonKinshipTest,
    doListKinships,
    doListPersonKinships,
    deletePersonKinship
  };
}
