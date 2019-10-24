'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const constants = require('./constants');

const Op = Sequelize.Op;

module.exports = function setupPersonService(dependencies) {
  let baseService = new setupBaseService();
  const contactTypeModel = dependencies.contactTypeModel;
  const countryModel = dependencies.countryModel;
  const documentTypeModel = dependencies.documentTypeModel;
  const genderModel = dependencies.genderModel;
  const kinshipModel = dependencies.kinshipModel;
  const personModel = dependencies.personModel;
  const sharedService = dependencies.sharedService;

  //#region Helpers
  async function confirmCreateKinship(kinship) {
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
      const paternalGrandmotherKinship = kinships.find(k => k.personId === fatherKinship.relativeId && !k.relative.isGhost && k.kinshipType === constants.motherKinshipType.id);
      tree.paternalGrandmother = paternalGrandmotherKinship && paternalGrandmotherKinship.relative;
      // Get and attach maternal grandfather
      const maternalGrandfatherKinship = kinships.find(k => k.personId === motherKinship.relativeId && !k.relative.isGhost && k.kinshipType === constants.fatherKinshipType.id);
      tree.maternalGrandfather = maternalGrandfatherKinship && maternalGrandfatherKinship.relative;
      // Get and attach maternal grandmother
      const maternalGrandmotherKinship = kinships.find(k => k.personId === motherKinship.relativeId && !k.relative.isGhost && k.kinshipType === constants.motherKinshipType.id);
      tree.maternalGrandmother = maternalGrandmotherKinship && maternalGrandmotherKinship.relative;
    }
    return tree;
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
      name: model.name,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    };
  }

  function getTreesComparingResult(currentTree, updatedTree) {
    const testResults = {
      added: [],
      modified: [],
      deleted: []
    };
    // Compare couples
    if (currentTree.couple) {
      if (!updatedTree.couple) {
        // Deleted
        testResults.deleted.push(`${constants.coupleKinshipType.name} kinship with ${currentTree.couple.name} ${currentTree.couple.lastName} will be deleted`);
      } else if (currentTree.couple.id !== updatedTree.couple.id) {
        // Modified
        testResults.modified.push(`${constants.coupleKinshipType.name} kinship with ${currentTree.couple.name} ${currentTree.couple.lastName} will be modified to ${updatedTree.couple.name} ${updatedTree.couple.lastName}`);
      }
    } else if (updatedTree.couple) {
      // Added
      testResults.added.push(`${constants.coupleKinshipType.name} kinship with ${updatedTree.couple.name} ${updatedTree.couple.lastName} will be added`);
    }
    // Compare fathers
    if (currentTree.father) {
      if (!updatedTree.father) {
        // Deleted
        testResults.deleted.push(`${constants.fatherKinshipType.name} kinship with ${currentTree.father.name} ${currentTree.father.lastName} will be deleted`);
      } else if (currentTree.couple.id !== updatedTree.couple.id) {
        // Modified
        testResults.modified.push(`${constants.fatherKinshipType.name} kinship with ${currentTree.father.name} ${currentTree.father.lastName} will be modified to ${updatedTree.father.name} ${updatedTree.father.lastName}`);
      }
    } else if (updatedTree.father) {
      // Added
      testResults.added.push(`${constants.fatherKinshipType.name} kinship with ${updatedTree.father.name} ${updatedTree.father.lastName} will be added`);
    }
    // Compare mothers
    if (currentTree.mother) {
      if (!updatedTree.mother) {
        // Deleted
        testResults.deleted.push(`${constants.motherKinshipType.name} kinship with ${currentTree.mother.name} ${currentTree.mother.lastName} will be deleted`);
      } else if (currentTree.couple.id !== updatedTree.couple.id) {
        // Modified
        testResults.modified.push(`${constants.motherKinshipType.name} kinship with ${currentTree.mother.name} ${currentTree.mother.lastName} will be modified to ${updatedTree.mother.name} ${updatedTree.mother.lastName}`);
      }
    } else if (updatedTree.mother) {
      // Added
      testResults.added.push(`${constants.motherKinshipType.name} kinship with ${updatedTree.mother.name} ${updatedTree.mother.lastName} will be added`);
    }
    // Compare siblings
    updatedTree.siblings // Added
      .filter(s => !currentTree.siblings.includes(s))
      .forEach(s => testResults.added.push(`${constants.siblingKinshipType.name} kinship with ${s.name} ${s.lastName} will be added`));
    currentTree.siblings // Deleted
      .filter(s => !updatedTree.siblings.includes(s))
      .forEach(s => testResults.deleted.push(`${constants.siblingKinshipType.name} kinship with ${s.name} ${s.lastName} will be deleted`));
    // Compare paternal grandfathers
    if (currentTree.paternalGrandfather) {
      if (!updatedTree.paternalGrandfather) {
        // Deleted
        testResults.deleted.push(`${constants.paternalGrandfatherKinshipType.name} kinship with ${currentTree.paternalGrandfather.name} ${currentTree.paternalGrandfather.lastName} will be deleted`);
      } else if (currentTree.paternalGrandfather.id !== updatedTree.paternalGrandfather.id) {
        // Modified
        testResults.modified.push(`${constants.paternalGrandfatherKinshipType.name} kinship with ${currentTree.paternalGrandfather.name} ${currentTree.paternalGrandfather.lastName} will be modified to ${updatedTree.paternalGrandfather.name} ${updatedTree.paternalGrandfather.lastName}`);
      }
    } else if (updatedTree.paternalGrandfather) {
      // Added
      testResults.added.push(`${constants.paternalGrandfatherKinshipType.name} kinship with ${updatedTree.paternalGrandfather.name} ${updatedTree.paternalGrandfather.lastName} will be added`);
    }
    // Compare paternal grandmothers
    if (currentTree.paternalGrandmother) {
      if (!updatedTree.paternalGrandmother) {
        // Deleted
        testResults.deleted.push(`${constants.paternalGrandmotherKinshipType.name} kinship with ${currentTree.paternalGrandmother.name} ${currentTree.paternalGrandmother.lastName} will be deleted`);
      } else if (currentTree.paternalGrandmother.id !== updatedTree.paternalGrandmother.id) {
        // Modified
        testResults.modified.push(`${constants.paternalGrandmotherKinshipType.name} kinship with ${currentTree.paternalGrandmother.name} ${currentTree.paternalGrandmother.lastName} will be modified to ${updatedTree.paternalGrandmother.name} ${updatedTree.paternalGrandmother.lastName}`);
      }
    } else if (updatedTree.paternalGrandmother) {
      // Added
      testResults.added.push(`${constants.paternalGrandmotherKinshipType.name} kinship with ${updatedTree.paternalGrandmother.name} ${updatedTree.paternalGrandmother.lastName} will be added`);
    }
    // Compare maternal grandfathers
    if (currentTree.maternalGrandfather) {
      if (!updatedTree.maternalGrandfather) {
        // Deleted
        testResults.deleted.push(`${constants.maternalGrandfatherKinshipType.name} kinship with ${currentTree.maternalGrandfather.name} ${currentTree.maternalGrandfather.lastName} will be deleted`);
      } else if (currentTree.maternalGrandfather.id !== updatedTree.maternalGrandfather.id) {
        // Modified
        testResults.modified.push(`${constants.maternalGrandfatherKinshipType.name} kinship with ${currentTree.maternalGrandfather.name} ${currentTree.maternalGrandfather.lastName} will be modified to ${updatedTree.maternalGrandfather.name} ${updatedTree.maternalGrandfather.lastName}`);
      }
    } else if (updatedTree.maternalGrandfather) {
      // Added
      testResults.added.push(`${constants.maternalGrandfatherKinshipType.name} kinship with ${updatedTree.maternalGrandfather.name} ${updatedTree.maternalGrandfather.lastName} will be added`);
    }
    // Compare maternal grandfathers
    if (currentTree.maternalGrandmother) {
      if (!updatedTree.maternalGrandmother) {
        // Deleted
        testResults.deleted.push(`${constants.maternalGrandmotherKinshipType.name} kinship with ${currentTree.maternalGrandmother.name} ${currentTree.maternalGrandmother.lastName} will be deleted`);
      } else if (currentTree.maternalGrandmother.id !== updatedTree.maternalGrandmother.id) {
        // Modified
        testResults.modified.push(`${constants.maternalGrandmotherKinshipType.name} kinship with ${currentTree.maternalGrandmother.name} ${currentTree.maternalGrandmother.lastName} will be modified to ${updatedTree.maternalGrandmother.name} ${updatedTree.maternalGrandmother.lastName}`);
      }
    } else if (updatedTree.maternalGrandmother) {
      // Added
      testResults.added.push(`${constants.maternalGrandmotherKinshipType.name} kinship with ${updatedTree.maternalGrandmother.name} ${updatedTree.maternalGrandmother.lastName} will be added`);
    }
    // Return the test results
    return testResults;
  }

  async function testCreateCoupleKinship(kinship, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    // Check if there's a couple kinship registered, and if so, update it and its counterpart
    const coupleKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.coupleKinshipType.id);
    if (coupleKinship) {
      const coupleKinshipCounterpart = kinships.find(k => k.personId === coupleKinship.relativeId && k.relativeId === kinship.personId && k.kinshipType === constants.coupleKinshipType.id);
      coupleKinship.relative = relative;
      coupleKinship.relativeId = kinship.relativeId;
      coupleKinshipCounterpart.person = relative;
      coupleKinshipCounterpart.personId = kinship.relativeId;
    }
    // Else, register the new couple kinship and its counterpart
    else {
      kinships.push({ personId: kinship.personId, person, relativeId: kinship.relativeId, relative, kinshipType: constants.coupleKinshipType.id });
      kinships.push({ personId: kinship.relativeId, person: relative, relativeId: kinship.personId, relative: person, kinshipType: constants.coupleKinshipType.id });
    }
  }

  async function testCreateFatherKinship(kinship, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    // Check if there's a father kinship registered
    const fatherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there's a father kinship, update that kinship and all the other kinships in which they are involved
    if (fatherKinship && fatherKinship.relative.isGhost) {
      fatherKinship.person = person;
      fatherKinship.personId = kinship.personId;
      kinships
        .filter(k => k.personId === fatherKinship.relativeId)
        .forEach(k => k.personId = kinship.relativeId);
      kinships
        .filter(k => k.relativeId === fatherKinship.relativeId)
        .forEach(k => k.relativeId = kinship.relativeId);
    }
    // Else, a ghost mother has to be created along with the new father kinship
    else {
      const ghostMother = await personModel.create({ genderId: 2, isGhost: true });
      kinships.push({ personId: kinship.personId, person, relativeId: ghostMother.id, relative: ghostMother, kinshipType: constants.motherKinshipType.id });
      kinships.push({ personId: kinship.personId, person, relativeId: kinship.relativeId, relative, kinshipType: constants.fatherKinshipType.id });
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
    return getTreesComparingResult(currentTree, updatedTree);
  }

  async function testCreateMaternalGrandfatherKinship(kinship, kinships) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Check if the person has a registered mother kinship
    const motherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.motherKinshipType.id);
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
      await testCreateMotherKinship({ personId: kinship.personId, relativeId: motherId, kinshipType: constants.motherKinshipType.id }, kinships);
    }
    // Use the testCreateFatherKinship method to register the new grandfather as the father of the person's mother
    // It also makes sure that a ghost grandmother is created
    await testCreateFatherKinship({ personId: motherId, relativeId: kinship.relativeId, kinshipType: constants.fatherKinshipType.id }, kinships);
  }

  async function testCreateMaternalGrandmotherKinship(kinship, kinships) {
    // Declare temp variable to hold the intermediate mother id
    let motherId;
    // Check if the person has a registered mother kinship
    const motherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.motherKinshipType.id);
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
      await testCreateMotherKinship({ personId: kinship.personId, relativeId: motherId, kinshipType: constants.motherKinshipType.id }, kinships);
    }
    // Use the testCreateMotherKinship method again to register the new grandmother as the mother of the person's mother
    // It also makes sure that a ghost grandfather is created
    await testCreateMotherKinship({ personId: motherId, relativeId: kinship.relativeId, kinshipType: constants.motherKinshipType.id }, kinships);
  }

  async function testCreateMotherKinship(kinship, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    // Check if there's a mother kinship registered
    const motherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.motherKinshipType.id);
    // If there's a mother kinship, update that kinship and all the other kinships in which they are involved
    if (motherKinship && motherKinship.relative.isGhost) {
      motherKinship.person = person;
      motherKinship.personId = kinship.personId;
      kinships
        .filter(k => k.personId === motherKinship.relativeId)
        .forEach(k => k.personId = kinship.relativeId);
      kinships
        .filter(k => k.relativeId === motherKinship.relativeId)
        .forEach(k => k.relativeId = kinship.relativeId);
    }
    // Else, a ghost father has to be created along with the new father kinship
    else {
      const ghostFather = await personModel.create({ genderId: 2, isGhost: true });
      kinships.push({ personId: kinship.personId, person, relativeId: ghostFather.id, relative: ghostFather, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId: kinship.personId, person, relativeId: kinship.relativeId, relative, kinshipType: constants.motherKinshipType.id });
    }
  }

  async function testCreatePaternalGrandfatherKinship(kinship, kinships) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Check if the person has a registered father kinship
    const fatherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.fatherKinshipType.id);
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
      await testCreateFatherKinship({ personId: kinship.personId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id }, kinships);
    }
    // Use the testCreateFatherKinship method again to register the new grandfather as the father of the person's father
    // It also makes sure that a ghost grandmother is created
    await testCreateFatherKinship({ personId: fatherId, relativeId: kinship.relativeId, kinshipType: constants.fatherKinshipType.id }, kinships);
  }

  async function testCreatePaternalGrandmotherKinship(kinship, kinships) {
    // Declare temp variable to hold the intermediate father id
    let fatherId;
    // Check if the person has a registered father kinship
    const fatherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.fatherKinshipType.id);
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
      await testCreateFatherKinship({ personId: kinship.personId, relativeId: fatherId, kinshipType: constants.fatherKinshipType.id }, kinships);
    }
    // Use the testCreateMotherKinship method to register the new grandmother as the mother of the person's father
    // It also makes sure that a ghost grandfather is created
    await testCreateMotherKinship({ personId: fatherId, relativeId: kinship.relativeId, kinshipType: constants.motherKinshipType.id }, kinships);
  }

  async function testCreateSiblingKinship(kinship, kinships) {
    // Get the people
    const person = await personModel.findOne({ where: { id: kinship.personId } });
    const relative = await personModel.findOne({ where: { id: kinship.relativeId } });
    // Declare temp variables to hold the parents
    let father;
    let mother;
    // Check if there's a father kinship registered
    const fatherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.fatherKinshipType.id);
    // If there's a father kinship, then there's also a mother kinship
    if (fatherKinship) {
      // Get the mother's kinship
      const motherKinship = kinships.find(k => k.personId === kinship.personId && k.kinshipType === constants.motherKinshipType.id);
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
      kinships.push({ personId: kinship.personId, person, relativeId: father.id, relative: father, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId: kinship.personId, person, relativeId: mother.id, relative: mother, kinshipType: constants.motherKinshipType.id });
    }
    // Check if the new sibling has parents kinships, by looking only for an existent father kinship
    const relativeFatherKinship = kinships.find(k => k.personId === kinship.relativeId && k.kinshipType === constants.fatherKinshipType.id);
    // If such kinships exist, update them
    if (relativeFatherKinship) {
      relativeFatherKinship.relative = father;
      relativeFatherKinship.relativeId = father.id;
      const relativeMotherKinship = kinships.find(k => k.personId === kinship.relativeId && k.kinshipType === constants.motherKinshipType.id);
      relativeMotherKinship.relative = mother;
      relativeMotherKinship.relativeId = mother.id;
    }
    // Else, create them
    else {
      kinships.push({ personId: kinship.relativeId, person: relative, relativeId: father.id, relative: father, kinshipType: constants.fatherKinshipType.id });
      kinships.push({ personId: kinship.relativeId, person: relative, relativeId: mother.id, relative: mother, kinshipType: constants.motherKinshipType.id });
    }
  }

  async function updateTestKinships(kinship, kinships) {
    // Create couple kinship
    if (kinship.kinshipType === constants.coupleKinshipType.id) {
      await testCreateCoupleKinship(kinship, kinships);
    }
    // Create father kinship
    else if (kinship.kinshipType === constants.fatherKinshipType.id) {
      await testCreateFatherKinship(kinship, kinships);
    }
    // Create mother kinship
    else if (kinship.kinshipType === constants.motherKinshipType.id) {
      await testCreateMotherKinship(kinship, kinships);
    }
    // Create sibling kinship
    else if (kinship.kinshipType === constants.siblingKinshipType.id) {
      await testCreateSiblingKinship(kinship, kinships);
    }
    // Create paternal grandfather kinship
    else if (kinship.kinshipType === constants.paternalGrandfatherKinshipType.id) {
      await testCreatePaternalGrandfatherKinship(kinship, kinships);
    }
    // Create paternal grandmother kinship
    else if (kinship.kinshipType === constants.paternalGrandmotherKinshipType.id) {
      await testCreatePaternalGrandmotherKinship(kinship, kinships);
    }
    // Create maternal grandfather kinship
    else if (kinship.kinshipType === constants.maternalGrandfatherKinshipType.id) {
      await testCreateMaternalGrandfatherKinship(kinship, kinships);
    }
    // Create maternal grandmother kinship
    else if (kinship.kinshipType === constants.maternalGrandmotherKinshipType.id) {
      await testCreateMaternalGrandmotherKinship(kinship, kinships);
    }
  }
  //#endregion

  async function doList(requestQuery) {
    try {
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
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function doListKinships(id) {
    try {
      // Get person
      const person = await personModel.findOne({ where: { id } });
      // Validate if person exists
      if (!person || person.isGhost) {
        baseService.returnData.responseCode = 404;
        baseService.returnData.message = 'Not found';
        baseService.returnData.data = {};
        return baseService.returnData;
      }
      // Get kinships
      const personData = await sharedService.getPersonKinships(person);
      // Return the data
      return baseService.getServiceResponse(200, 'Success', personData);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }

    return baseService.returnData;
  }

  async function modify(id, person) {
    try {
      // Check if person exists
      const personExists = await personModel.findOne({ where: { id } });
      if (!personExists || personExists.isGhost) {
        return baseService.getServiceResponse(404, 'Not found', {});
      }
      // Check if document exists
      const documentExists = await personModel.findOne({ where: { document: person.document } });
      if (documentExists && documentExists.id !== id) {
        return baseService.getServiceResponse(400, 'Document field must be unique', {});
      }
      // Validate errors
      const errors = [];
      if (person.birthdate) {
        sharedService.validateBirthdate(person.birthdate, errors);
      }
      if (person.contactType1Id) {
        sharedService.validateContact(person.contactType1Id, person.contact1, errors);
      }
      if (person.contactType2Id) {
        sharedService.validateContact(person.contactType2Id, person.contact2, errors);
      }
      if (person.countryId) {
        sharedService.validateCountry(person.countryId, errors);
      }
      if (person.documentTypeId) {
        sharedService.validateDocument(person.documentTypeId, person.document, errors);
      }
      if (person.lastName) {
        sharedService.validateLastName(person.lastName, errors);
      }
      if (person.name) {
        sharedService.validateName(person.name, errors);
      }
      if (errors.length > 0) {
        // If some errors were found, return 400
        return baseService.getServiceResponse(400, errors.join('\n'), {})
      } else {
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

    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function create(person) {
    try {
      // Check if document exists
      const documentExists = await personModel.findOne({ where: { document: person.document } });
      if (documentExists) {
        return baseService.getServiceResponse(400, 'Document field must be unique', {});
      }
      // Validate errors
      const errors = [];
      sharedService.validateBirthdate(person.birthdate, errors);
      sharedService.validateCountry(person.countryId, errors);
      sharedService.validateDocument(person.documentTypeId, person.document, errors);
      sharedService.validateGender(person.genderId, errors);
      sharedService.validateLastName(person.lastName, errors);
      sharedService.validateName(person.name, errors);
      if (person.contactType1Id) {
        sharedService.validateContact(person.contactType1Id, person.contact1, errors);
      }
      if (person.contactType2Id) {
        sharedService.validateContact(person.contactType2Id, person.contact2, errors);
      }
      if (errors.length > 0) {
        // If some errors were found, return 400
        return baseService.getServiceResponse(400, errors.join('\n'), {})
      } else {
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
        return baseService.getServiceResponse(200, "Person created", getSimplePersonModel(createdPerson));
      }
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function createKinship(kinship) {
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
      await confirmCreateKinship(kinship);
      return baseService.getServiceResponse(200, 'Success', {});
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function createKinshipTest(kinship) {
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
      // If no errors were found, test the kinship creation
      const personData = await testCreateKinship(kinship);
      return baseService.getServiceResponse(200, 'Success', personData);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  async function findById(id) {
    try {
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
      if (person && !person.isGhost) {
        // If a person was found, return 200
        return baseService.getServiceResponse(200, "Success", getSimplePersonModel(person));
      } else {
        // Else, return 404
        return baseService.getServiceResponse(404, "Not found", {});
      }

    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doList,
    doListKinships,
    create,
    createKinship,
    createKinshipTest,
    modify,
    findById
  };
};
