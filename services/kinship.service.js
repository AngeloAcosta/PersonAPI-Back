'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const Op = Sequelize.Op;

module.exports = function setupKinshipService(models) {
  const personModel = models.personModel;
  const kinshipModel = models.kinshipModel;
  const validationService = models.validationService;
  let baseService = new setupBaseService();

  async function create(kinshipData) {
    try {
      // let dbService = await setupDBService();
      const personId = kinshipData.personId;
      const relativeId = kinshipData.relativeId;
      const kinshipType = kinshipData.kinshipType;
      const validationResult = await validationService.validateKinshipCreation(
        personId,
        relativeId,
        kinshipType
      );

      if (validationResult) {
        await kinshipModel.create(kinshipData);
        baseService.returnData.responseCode = 200;
        baseService.returnData.message = 'Getting data successfully';
        baseService.returnData.data = {};
      } else {
        baseService.returnData.responseCode = 400;
        baseService.returnData.message = 'Error adding kinship';
        baseService.returnData.data = {};
      }
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }
    baseService.returnData.responseCode = 200;
    baseService.returnData.message = 'Getting data successfully';
    baseService.returnData.data = {};

    return baseService.returnData;
  }

  function getOrderField(orderBy) {
    let qOrderBy = ['person', 'name'];
    if (orderBy === 2) {
      qOrderBy = ['person', 'name'];
    } else if (orderBy === 3) {
      qOrderBy = ['relative', 'name'];
    } else if (orderBy === 4) {
      qOrderBy = ['relative', 'document'];
    }
    return qOrderBy;
  }

  function getOrderType(orderType) {
    let qOrderType = 'ASC';
    if (orderType === 2) {
      qOrderType = 'DESC';
    }
    return qOrderType;
  }

  
  /*function getDoListModel(kinships) {
    return kinships.map(kinship => {
      const person = {
        name: '$person.name$',
        lastName: '',
        document: ''
      };
      const relative = {
        name: '',
        lastName: '',
        document: ''
      };
      const kinshipType = '';

      return {
        person,
        relative,
        kinshipType
      }
    });
  }*/

  async function doList(requestQuery) {
    try {
      const qQueryWhereClause = { [Op.like]: `%${requestQuery.query}%` };
      const levelTwo = await kinshipModel.findAll({
        attributes: ['kinshipType'],
        include:[
          {
            as: 'person',
            model: personModel
          },
          {
            as: 'relative',
            model: personModel 
          }
        ],
        where: {
          [Op.or]: [{kinshipType: 'M'},{kinshipType: 'F'}],
          [Op.or]:[ {'$person.name$': qQueryWhereClause },{ '$person.lastName$': qQueryWhereClause}]
        }
      })
        // Mold the response
      //const levelTwo = getDoListModel(levelTwo);

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = levelTwo;
    } catch (err) {
      console.log('Error: ', err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = '' + err;
      baseService.returnData.data = [];
    }

    return baseService.returnData;
  }

  async function findById(id) {
    try {
      console.log(id);

      const kinship = await kinshipModel.findOne({
        where: {
          id
        }
      });

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = kinship;
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
    findById,
    create
  };
};
