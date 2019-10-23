'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const personValidation = require('./personvalidation.service.js');
const constants = require('./constants');

const Op = Sequelize.Op;

module.exports = function setupPersonService(models) {
  const contactTypeModel = models.contactTypeModel;
  const countryModel = models.countryModel;
  const documentTypeModel = models.documentTypeModel;
  const genderModel = models.genderModel;
  const kinshipModel = models.kinshipModel;
  const personModel = models.personModel;
  let baseService = new setupBaseService();
  const personValidator = new personValidation();
  //#region Helpers
  async function getCouple(personId) {
    const coupleKinship = await kinshipModel.findOne({
      include: [{ as: 'relative', model: personModel }],
      where: { personId, kinshipType: constants.coupleKinshipType.id }
    });
    return coupleKinship && coupleKinship.relative;
  }

  function getDoListModel(people) {
    return people.map(person => {
      let contactType1 = null;
      if (person.contactType1) {
        contactType1 = person.contactType1.name;
      }
      let contactType2 = null;
      if (person.contactType2) {
        contactType2 = person.contactType2.name;
      }
      return {
        id: person.id,
        name: person.name,
        lastName: person.lastName,
        birthdate: person.birthdate,
        documentType: person.documentType.name,
        document: person.document,
        gender: person.gender.name,
        country: person.country.name,
        contactType1,
        contact1: person.contact1,
        contactType2,
        contact2: person.contact2,
      };
    });
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
  // #endregion

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
      // Mold the response
      const peopleData = getDoListModel(people);
      // Return the data
      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = peopleData;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
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
      const personData = await getPersonKinships(person);
      // Return the data
      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Success';
      baseService.returnData.data = personData;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }



  async function modifyPerson(request) {
    let errors = [];
    try {
      //Check if person exists
      const where = {
        id: request.params.id
      };
      const person = await personModel.findOne({
        where
      });

      if (person) {
        //Proper data validation for each field to modify

        errors = errors.concat(personValidator.checkBlankSpacesfor(request.body));

        errors = errors.concat(personValidator.checkNameFormat(request.body));

        errors = errors.concat(personValidator.checkDocument(request.body));

        errors = errors.concat(personValidator.checkBirthData(request.body));

        errors = errors.concat(
          personValidator.checkContactData(
            request.body.contactType1Id,
            request.body.contact1
          )
        );
        //Set null values if is blank
        if (request.body.contactType1Id == '') {
          request.body.contactType1Id = null;
          request.body.contact1 = null;
        }

        if (request.body.contactType2Id == '') {
          request.body.contactType2Id = null;
          request.body.contact2 = null;
        }

        errors = errors.concat(
          personValidator.checkContactData(
            request.body.contactType2Id,
            request.body.contact2
          )
        );
        console.log(request.body);
        //Send Validation Errors or Update the data

        if (errors.length) {
          baseService.returnData.responseCode = 400;
          baseService.returnData.message = 'Errors from data validation';
          baseService.returnData.data = errors;
        } else {
          const personModified = await personModel.update(request.body, {
            where
          });

          baseService.returnData.responseCode = 200;
          baseService.returnData.message = 'Update completed successfully.';
          baseService.returnData.data = personModified;
        }
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message = 'Person doesnt exist on the database.';
        baseService.returnData.data = errors;
      }
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }


  async function create(request) {
    try {
      const newUser = {
        name: request.body.name,
        lastName: request.body.lastName,
        birthdate: request.body.birthdate, //Format: YYYY-MM-DD
        documentTypeId: request.body.documentTypeId,
        document: request.body.document,
        genderId: request.body.genderId,
        countryId: request.body.countryId,
        contact1: request.body.contact1,
        contactType1Id: request.body.contactType1Id,
        contact2: request.body.contact2,
        contactType2Id: request.body.contactType2Id,
        isGhost: false
      };

      let errors = [];
      errors = errors.concat(personValidator.checkBlankSpacesfor(request.body));

      errors = errors.concat(personValidator.checkDocument(request.body));

      errors = errors.concat(personValidator.checkBirthData(request.body));

      errors = errors.concat(personValidator.checkNameFormat(request.body));

      errors = errors.concat(
        personValidator.checkContactData(
          request.body.contactType1Id,
          request.body.contact1
        )
      );

      errors = errors.concat(
        personValidator.checkContactData(
          request.body.contactType2Id,
          request.body.contact2
        )
      );

      if (errors.length) {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message = 'Errors from data validation';
        baseService.returnData.data = errors;
      } else {
        let created = await personModel.create(newUser); //Create user
        if (created) {
          console.log('The person was registered');
          baseService.returnData.responseCode = 200;
          baseService.returnData.message = 'Data was registered satisfactory';
        }

      }



    } catch (err) {
      console.log('The person wasn\'t registered ' + err);
      baseService.returnData.responseCode = 500; //Validation error
      baseService.returnData.message = 'The person wasn\'t registered';
    }
    return baseService.returnData;
  }

  async function findById(id) {
    try {
      const person = await personModel.findOne({
        include: [
          { as: 'documentType', model: documentTypeModel },
          { as: 'gender', model: genderModel },
          { as: 'country', model: countryModel },
          { as: 'contactType1', model: contactTypeModel },
          { as: 'contactType2', model: contactTypeModel }
        ],
        where: {
          id
        }


      });
      let contactType1 = null;
      if (person.contactType1) {
        contactType1 = person.contactType1.name;
      }
      let contactType2 = null;
      if (person.contactType2) {
        contactType2 = person.contactType2.name;
      }
      const peopleData = {

        id: person.id,
        name: person.name,
        lastName: person.lastName,
        birthdate: person.birthdate,
        documentType: person.documentType.name,
        document: person.document,
        country: person.country.name,
        gender: person.gender.name,
        contactType1,
        contact1: person.contact1,
        contactType2,
        contact2: person.contact2,
      }


      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = peopleData;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  return {
    doList,
    doListKinships,
    create,
    modifyPerson,
    findById,
    getPersonKinships // TODO: Move this to a shared service file
  };
};