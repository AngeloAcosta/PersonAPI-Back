'use strict';

const Sequelize = require('sequelize');
const constants = require('./constants');
const setupBaseService = require('./base.service');

const Op = Sequelize.Op;

module.exports = function setupPersonService(dependencies) {
  let baseService = new setupBaseService();
  const contactTypeModel = dependencies.contactTypeModel;
  const countryModel = dependencies.countryModel;
  const documentTypeModel = dependencies.documentTypeModel;
  const genderModel = dependencies.genderModel;
  const kinshipModel = dependencies.kinshipModel;
  const personModel = dependencies.personModel;

  //#region Helpers TODO: Maybe move this to its own service
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

  async function createCoupleKinship(personId, relativeId) {
    // Check if there's a couple kinship registered, and if so, update it and its counterpart
    const coupleKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
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
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    // If there's a father kinship, update that kinship and all the other kinships in which they are involved
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
    // Check if there's a mother kinship registered
    const motherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
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

  function getOrderField(orderBy) {
    let qOrderBy;
    switch (orderBy) {
      case 1:
        qOrderBy = ['name'];
        break;
      case 2:
        qOrderBy = ['document'];
        break;
      case 3:
        qOrderBy = ['documentType', 'name'];
        break;
      case 4:
        qOrderBy = ['country', 'name'];
        break;
      default:
        qOrderBy = 'name';
        break;
    }
    return qOrderBy;
  }

  function getOrderType(orderType) {
    let qOrderType;
    switch (orderType) {
      case 1:
        qOrderType = 'ASC';
        break;
      case 2:
        qOrderType = 'DESC';
        break;
      default:
        qOrderType = 'ASC';
        break;
    }
    return qOrderType;
  }

  function getQueryWhereClause(queries) {
    return {
      [Op.or]: queries.map(q => {
        return { [Op.like]: `%${q}%` };
      })
    };
  }

  function getSimplePersonModel(model) {
    return {
      id: model.id,
      birthdate: model.birthdate,
      contact1: model.contact1,
      contactType1: model.contactType1 && model.contactType1.name,
      contactType1Id: model.contactType1 && model.contactType1.id,
      contact2: model.contact2,
      contactType2: model.contactType2 && model.contactType2.name,
      contactType2Id: model.contactType2 && model.contactType2.id,
      country: model.country.name,
      countryId: model.country.id,
      document: model.document,
      documentType: model.documentType.name,
      documentTypeId: model.documentType.id,
      gender: model.gender.name,
      genderId: model.gender.id,
      lastName: model.lastName,
      name: model.name
    };
  }

  async function testCreateCoupleKinship(personId, relativeId, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: personId } });
    const relative = await personModel.findOne({ where: { id: relativeId } });
    // Check if there's a couple kinship registered, and if so, update it and its counterpart
    const coupleKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.coupleKinshipType.id);
    if (coupleKinship) {
      const coupleKinshipCounterpart = kinships.find(k => k.personId === coupleKinship.relativeId && k.relativeId === personId && k.kinshipType === constants.coupleKinshipType.id);
      coupleKinship.relative = relative;
      coupleKinship.relativeId = relativeId;
      coupleKinshipCounterpart.person = relative;
      coupleKinshipCounterpart.personId = relativeId;
    }
    // Else, register the new couple kinship and its counterpart
    else {
      kinships.push({ personId, person, relativeId, relative, kinshipType: constants.coupleKinshipType.id });
      kinships.push({ personId: relativeId, person: relative, relativeId: personId, relative: person, kinshipType: constants.coupleKinshipType.id });
    }
  }

  async function testCreateFatherKinship(personId, relativeId, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: personId } });
    const relative = await personModel.findOne({ where: { id: relativeId } });
    // Check if there's a father kinship registered
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there's a father kinship, update that kinship and all the other kinships in which they are involved
    if (fatherKinship && fatherKinship.relative.isGhost) {
      fatherKinship.person = person;
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
      kinships.push({ personId, person, relativeId: ghostMother.id, relative: ghostMother, kinshipType: constants.motherKinshipType.id });
      kinships.push({ personId, person, relativeId, relative, kinshipType: constants.fatherKinshipType.id });
    }
  }

  async function testCreateKinship(kinship) {
    // Get all kinships into a test array
    const kinships = await kinshipModel.findAll({
      include: [{ as: 'person', model: personModel }],
      include: [{ as: 'relative', model: personModel }]
    });
    // Get tree using test array
    const currentTree = getComparingTree(kinship.personId, kinships);
    // Update test kinships array
    await updateTestKinships(kinship, kinships);
    // Get updated tree using test array
    const updatedTree = getComparingTree(kinship.personId, kinships);
    // Compare trees and return the result
    console.log(currentTree, updatedTree);
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
      await testCreateMotherKinship({ personId, relativeId: motherId, kinshipType: constants.motherKinshipType.id }, kinships);
    }
    // Use the testCreateFatherKinship method to register the new grandfather as the father of the person's mother
    // It also makes sure that a ghost grandmother is created
    await testCreateFatherKinship({ personId: motherId, relativeId, kinshipType: constants.fatherKinshipType.id }, kinships);
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
      await testCreateMotherKinship({ personId, relativeId: motherId, kinshipType: constants.motherKinshipType.id }, kinships);
    }
    // Use the testCreateMotherKinship method again to register the new grandmother as the mother of the person's mother
    // It also makes sure that a ghost grandfather is created
    await testCreateMotherKinship({ personId: motherId, relativeId, kinshipType: constants.motherKinshipType.id }, kinships);
  }

  async function testCreateMotherKinship(personId, relativeId, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: personId } });
    const relative = await personModel.findOne({ where: { id: relativeId } });
    // Check if there's a mother kinship registered
    const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
    // If there's a mother kinship, update that kinship and all the other kinships in which they are involved
    if (motherKinship && motherKinship.relative.isGhost) {
      motherKinship.person = person;
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
      kinships.push({ personId, person, relativeId: ghostFather.id, relative: ghostFather, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId, person, relativeId, relative, kinshipType: constants.motherKinshipType.id });
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
      await testCreateFatherKinship({ personId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id }, kinships);
    }
    // Use the testCreateFatherKinship method again to register the new grandfather as the father of the person's father
    // It also makes sure that a ghost grandmother is created
    await testCreateFatherKinship({ personId: fatherId, relativeId, kinshipType: constants.fatherKinshipType.id }, kinships);
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
      await testCreateFatherKinship({ personId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id }, kinships);
    }
    // Use the testCreateMotherKinship method to register the new grandmother as the mother of the person's father
    // It also makes sure that a ghost grandfather is created
    await testCreateMotherKinship({ personId: fatherId, relativeId, kinshipType: constants.motherKinshipType.id }, kinships);
  }

  async function testCreateSiblingKinship(personId, relativeId, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: personId } });
    const relative = await personModel.findOne({ where: { id: relativeId } });
    // Declare temp variables to hold the parents
    let father;
    let mother;
    // Check if there's a father kinship registered
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there's a father kinship, then there's also a mother kinship
    if (fatherKinship) {
      // Get the mother's kinship
      const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
      // Save both parents
      father = fatherKinship.relative;
      mother = motherKinship.relative;
    }
    // Else, new ghost parents need to be created
    else {
      // Create the ghost parents
      const ghostFather = await personModel.create({ genderId: 1, isGhost: true });
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      // Save both parents
      father = ghostFather;
      mother = ghostMother;
      // Set both as parents of the person
      kinships.push({ personId, person, relativeId: father.id, relative: father, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId, person, relativeId: mother.id, relative: mother, kinshipType: constants.motherKinshipType.id });
    }
    // Check if the new sibling has parents kinships, by looking only for an existent father kinship
    const relativeFatherKinship = kinships.find(k => k.personId === relativeId && k.kinshipType === constants.fatherKinshipType.id);
    // If such kinships exist, update them
    if (relativeFatherKinship) {
      relativeFatherKinship.relative = father;
      relativeFatherKinship.relativeId = father.id;
      const relativeMotherKinship = kinships.find(k => k.personId === relativeId && k.kinshipType === constants.motherKinshipType.id);
      relativeMotherKinship.relative = mother;
      relativeMotherKinship.relativeId = mother.id;
    }
    // Else, create them
    else {
      kinships.push({ personId: relativeId, person: relative, relativeId: father.id, relative: father, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId: relativeId, person: relative, relativeId: mother.id, relative: mother, kinshipType: constants.motherKinshipType.id });
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

  function getComparingTree(personId, kinships) {
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
    if (coupleKinship && !coupleKinship.relative.isGhost) {
      tree.couple = coupleKinship.relative;
    }
    // Get (ghost) father
    const fatherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there is at least a (ghost) father, then the person has a tree...
    if (fatherKinship) {
      // Attach father
      if (!fatherKinship.relative.isGhost) {
        tree.father = fatherKinship.relative;
      }
      // Get and attach mother
      const motherKinship = kinships.find(k => k.personId === personId && k.kinshipType === constants.motherKinshipType.id);
      if (motherKinship && !motherKinship.relative.isGhost) {
        tree.mother = motherKinship.relative;
      }
      // Get and attach siblings
      tree.siblings = kinships
        .filter(k => k.personId !== personId && k.relativeId === fatherKinship.relativeId && k.kinshipType === constants.fatherKinshipType.id)
        .map(k => (k.person));
      // Get and attach paternal grandfather
      const paternalGrandfatherKinship = kinships.find(k => k.personId === fatherKinship.relativeId && k.kinshipType === constants.fatherKinshipType.id);
      if (paternalGrandfatherKinship && !paternalGrandfatherKinship.relative.isGhost) {
        tree.paternalGrandfather = paternalGrandfatherKinship.relative;
      }
      // Get and attach paternal grandmother
      const paternalGrandmotherKinship = kinships.find(k => k.personId === fatherKinship.relativeId && k.kinshipType === constants.motherKinshipType.id);
      if (paternalGrandmotherKinship && !paternalGrandmotherKinship.relative.isGhost) {
        tree.paternalGrandmother = paternalGrandmotherKinship.relative;
      }
      // Get and attach maternal grandfather
      const maternalGrandfatherKinship = kinships.find(k => k.personId === motherKinship.relativeId && k.kinshipType === constants.fatherKinshipType.id);
      if (maternalGrandfatherKinship && !maternalGrandfatherKinship.relative.isGhost) {
        tree.maternalGrandfather = maternalGrandfatherKinship.relative;
      }
      // Get and attach maternal grandmother
      const maternalGrandmotherKinship = kinships.find(k => k.personId === motherKinship.relativeId && k.kinshipType === constants.motherKinshipType.id);
      if (maternalGrandmotherKinship && !maternalGrandmotherKinship.relative.isGhost) {
        tree.maternalGrandmother = maternalGrandmotherKinship.relative;
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

  //#region Validators TODO: Maybe move this to its own service
  function validateBirthdate(birthdate, errors) {
    if (!birthdate) {
      errors.push('The birthdate field is required');
      return;
    }

    const parsedBirthdate = new Date(birthdate);
    const minDate = new Date('1900/01/01');
    const maxDate = Date.now();

    if (isNaN(parsedBirthdate)) {
      errors.push('Invalid birthdate format');
    } else if (parsedBirthdate < minDate || parsedBirthdate > maxDate) {
      errors.push('Invalid submitted birthdate');
    }
  }

  function validateContact(contactTypeId, contact, errors) {
    // Assuming that the contactTypeId is not null
    const phoneRegex = /^([0-9]){6,9}$/;
    const emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    if (![1, 2].includes(contactTypeId)) {
      errors.push('Invalid submitted contact type');
    } else if (contactTypeId === 1 && !phoneRegex.test(contact)) {
      errors.push('Invalid phone format');
    } else if (contactTypeId === 2 && !emailRegex.test(contact)) {
      errors.push('Invalid email format');
    }
  }

  function validateCountry(countryId, errors) {
    if (!countryId) {
      errors.push('The country field is required');
    } else if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(countryId)) {
      errors.push('Invalid submitted country');
    }
  }

  function validateDocument(documentTypeId, document, errors) {
    const dniRegex = /^[0-9]{1,8}$/;
    const passportRegex = /^([a-zA-Z0-9]){1,12}$/;
    const foreignCardRegex = /^([a-zA-Z0-9]){1,12}$/;
    if (!documentTypeId) {
      errors.push('The document field is required');
    } else if (![1, 2, 3].includes(documentTypeId)) {
      errors.push('Invalid submitted document type');
    } else if (documentTypeId === 1 && !dniRegex.test(document)) {
      errors.push('Invalid DNI format');
    } else if (documentTypeId === 2 && !passportRegex.test(document)) {
      errors.push('Invalid passport format');
    } else if (documentTypeId === 3 && !foreignCardRegex.test(document)) {
      errors.push('Invalid foreign card format');
    }
  }

  async function validateExistingRelationship(kinship, existingRelationshipValidator, errors) {
    // Assuming that the personId and the relativeId are valid
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    const personKinships = await existingRelationshipValidator(person);
    const relativeKinships = await existingRelationshipValidator(relative);
    if (personKinships.some(k => k.relativeId === relative.id) || relativeKinships.some(k => k.relativeId === person.id)) {
      errors.push('The person and the relative are already related');
    }
  }

  function validateGender(genderId, errors) {
    if (!genderId) {
      errors.push('The gender field is required');
    } else if (![1, 2].includes(genderId)) {
      errors.push('Invalid submitted gender');
    }
  }

  async function validateKinshipCreate(kinship, existingRelationshipValidator, errors) {
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
    await validateExistingRelationship(kinship, existingRelationshipValidator, errors);
    if (errors.length > 0) {
      return;
    }
  }

  async function validateKinshipData(kinship, errors) {
    // Validate person
    if (!kinship.personId) {
      errors.push('The person id is required');
    } else {
      const person = await personModel.findOne({ where: { id: kinship.personId } });
      if (!person || person.isGhost) {
        errors.push('Invalid submitted person');
      }
    }
    // Validate relative
    if (!kinship.relativeId) {
      errors.push('The relative id is required');
    } else if (kinship.personId === kinship.relativeId) {
      errors.push('The relative can\'t be the same as the person');
    } else {
      const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
      if (!relative || relative.isGhost) {
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

  function validateLastName(lastName, errors) {
    const lastNameRegex = /^[a-zA-ZñÑ'\s]{1,25}$/;
    if (!lastName) {
      errors.push('The last name field is required');
    } else if (!lastNameRegex.test(lastName)) {
      errors.push('Invalid last name format');
    }
  }

  function validateName(name, errors) {
    const nameRegex = /^[a-zA-ZñÑ'\s]{1,25}$/;
    if (!name) {
      errors.push('The name field is required');
    } else if (!nameRegex.test(name)) {
      errors.push('Invalid name format');
    }
  }

  async function validatePersonCreate(person, errors) {
    // Validate if document exists
    const documentExists = await personModel.findOne({ where: { document: person.document } });
    if (documentExists) {
      errors.push('Document field must be unique');
      return;
    }
    // Validate the rest of the fields
    validateBirthdate(person.birthdate, errors);
    validateCountry(person.countryId, errors);
    validateDocument(person.documentTypeId, person.document, errors);
    validateGender(person.genderId, errors);
    validateLastName(person.lastName, errors);
    validateName(person.name, errors);
    if (person.contactType1Id) {
      validateContact(person.contactType1Id, person.contact1, errors);
    }
    if (person.contactType2Id) {
      validateContact(person.contactType2Id, person.contact2, errors);
    }
  }

  async function validatePersonModify(id, person, errors) {
    // Validate if document exists
    const documentExists = await personModel.findOne({ where: { document: person.document } });
    if (documentExists && documentExists.id !== id) {
      errors.push('Document field must be unique');
    }
    // Validate the rest of the fields
    if (person.birthdate) {
      validateBirthdate(person.birthdate, errors);
    }
    if (person.contactType1Id) {
      validateContact(person.contactType1Id, person.contact1, errors);
    }
    if (person.contactType2Id) {
      validateContact(person.contactType2Id, person.contact2, errors);
    }
    if (person.countryId) {
      validateCountry(person.countryId, errors);
    }
    if (person.documentTypeId) {
      validateDocument(person.documentTypeId, person.document, errors);
    }
    if (person.lastName) {
      validateLastName(person.lastName, errors);
    }
    if (person.name) {
      validateName(person.name, errors);
    }
  }
  //#endregion

  async function doList(requestQuery) {
    // Get the query
    let qOrderBy = getOrderField(requestQuery.orderBy);
    let qOrderType = getOrderType(requestQuery.orderType);
    let qQueryWhereClause = getQueryWhereClause(requestQuery.query.split(' '));
    // Execute the query
    const people = await personModel.findAll({
      include: [
        { as: 'documentType', model: documentTypeModel },
        { as: 'gender', model: genderModel },
        { as: 'country', model: countryModel },
        { as: 'contactType1', model: contactTypeModel },
        { as: 'contactType2', model: contactTypeModel }
      ],
      limit: requestQuery.limit,
      offset: requestQuery.offset,
      order: [[...qOrderBy, qOrderType]],
      where: {
        [Op.or]: [
          { name: qQueryWhereClause },
          { lastName: qQueryWhereClause },
          { document: qQueryWhereClause },
          { contact1: qQueryWhereClause },
          { contact2: qQueryWhereClause }
        ]
      }
    });
    // Return the data
    return baseService.getServiceResponse(200, "Success", people.map(p => getSimplePersonModel(p)));
  }

  async function modify(id, person) {
    // If person doesn't exist, return 404
    const personExists = await personModel.findOne({ where: { id } });
    if (!personExists || personExists.isGhost) {
      return baseService.getServiceResponse(404, 'Not found', {});
    }
    // Else, validate fields
    const errors = [];
    await validatePersonModify(id, person, errors);
    // If errors were found, return 400
    if (errors.length > 0) {
      return baseService.getServiceResponse(400, "Error", errors.join('\n'));
    }
    // Else, create the person
    let modifiedPerson = await personModel.update(person, { where: { id } });
    // Then obtain their complete data (including associations)
    modifiedPerson = await personModel.findOne({
      include: [
        { as: 'documentType', model: documentTypeModel },
        { as: 'gender', model: genderModel },
        { as: 'country', model: countryModel },
        { as: 'contactType1', model: contactTypeModel },
        { as: 'contactType2', model: contactTypeModel }
      ],
      where: { id }
    });
    // And return 200
    return baseService.getServiceResponse(200, "Person modified", getSimplePersonModel(modifiedPerson));
  }

  async function create(person) {
    // Validate fields
    const errors = [];
    await validatePersonCreate(person, errors);
    // If errors were found, return 400
    if (errors.length > 0) {
      return baseService.getServiceResponse(400, "Error", errors.join('\n'));
    }
    // Else, create the person
    let createdPerson = await personModel.create(person);
    // Then obtain their complete data (including associations)
    createdPerson = await personModel.findOne({
      include: [
        { as: 'documentType', model: documentTypeModel },
        { as: 'gender', model: genderModel },
        { as: 'country', model: countryModel },
        { as: 'contactType1', model: contactTypeModel },
        { as: 'contactType2', model: contactTypeModel }
      ],
      where: { id: createdPerson.id }
    });
    // And return 200
    return baseService.getServiceResponse(200, "Success", getSimplePersonModel(createdPerson));
  }

  async function createKinship(kinship, existingRelationshipValidator) {
    // Validate creation
    const errors = [];
    await validateKinshipCreate(kinship, existingRelationshipValidator, errors);
    // If errors were gound, return 400
    if (errors.length > 0) {
      return baseService.getServiceResponse(400, errors.join('\n'), {});
    }
    // Else, create the kinship
    await confirmCreateKinship(kinship);
    // And return 200
    return baseService.getServiceResponse(200, 'Success', {});
  }

  async function createKinshipTest(kinship, existingRelationshipValidator) {
    // Validate creation
    const errors = [];
    await validateKinshipCreate(kinship, existingRelationshipValidator, errors);
    // If errors were gound, return 400
    if (errors.length > 0) {
      return baseService.getServiceResponse(400, errors.join('\n'), {});
    }
    // Else, test the kinship creation
    const personData = await testCreateKinship(kinship);
    // And return 200
    return baseService.getServiceResponse(200, 'Success', personData);
  }

  async function findById(id) {
    // Get models and find person
    const person = await personModel.findOne({
      include: [
        { as: 'documentType', model: documentTypeModel },
        { as: 'gender', model: genderModel },
        { as: 'country', model: countryModel },
        { as: 'contactType1', model: contactTypeModel },
        { as: 'contactType2', model: contactTypeModel }
      ],
      where: { id }
    });
    // If a person was found, return 200
    if (person && !person.isGhost) {
      return baseService.getServiceResponse(200, "Success", getSimplePersonModel(person));
    }
    // Else, return 404
    else {
      return baseService.getServiceResponse(404, "Not found", {});
    }
  }

  return {
    create,
    createKinship,
    createKinshipTest,
    doList,
    findById,
    modify,
    personModel
  };
};
