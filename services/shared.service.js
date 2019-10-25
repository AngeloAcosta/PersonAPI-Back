'use strict';

const Sequelize = require('sequelize');
const constants = require('./constants');

const Op = Sequelize.Op;

module.exports = function setupSharedService(dependencies) {
  const kinshipModel = dependencies.kinshipModel;
  const personModel = dependencies.personModel;

  //#region Helpers
  async function getCouple(personId) {
    const coupleKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.coupleKinshipType.id }
    });
    return coupleKinship && coupleKinship.relative;
  }

  async function getFather(personId) {
    const fatherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.fatherKinshipType.id }
    });
    return fatherKinship && fatherKinship.relative;
  }

  async function getMother(personId) {
    const motherKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.motherKinshipType.id }
    });
    return motherKinship && motherKinship.relative;
  }

  async function getSiblings(id, fatherId) {
    const siblingKinships = await kinshipModel.findAll({
      include: [{ as: 'person', model: personModel }],
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
  //#endregion

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

  return {
    getPersonKinships
  };
}
