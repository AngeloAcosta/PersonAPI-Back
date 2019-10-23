'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const Op = Sequelize.Op;
const setupPersonService = require('./person.service.js');

module.exports = function setupKinshipService(models) {
  const personModel = models.personModel;
  const kinshipModel = models.kinshipModel;
  let baseService = new setupBaseService();
  let personService = new setupPersonService(models);

  async function create(kinshipData) {
    
  }

  function getOrderFunction(listKinships){
    let qOrderBy = 1;
    if(qOrderBy = 1){
      getOrderPersonName(listKinships);
    }
  }
  function getOrderPersonName(listKinships){
    return listKinships.sort(((a, b) => (a.personName > b.personName) ? 1 : -1));
   }
  
  async function doList(requestQuery) {
   let listKinships =[]
    try {

      const qQueryWhereClause = { [Op.like]: `%${requestQuery.query}%` };

      const personid = await personModel.findAll({
        where: {
          [Op.or]: [
            { name: qQueryWhereClause },
            { lastName: qQueryWhereClause}
          ]
        }
      });
           for (let i = 0; i < personid.length;i++) {
            let kinships = await personService.getPersonKinships(personid[i]);
            if(kinships.length > 0){
             listKinships = listKinships.concat(kinships);
            }                 
          }    

      baseService.returnData.responseCode = 200;
      baseService.returnData.message = 'Getting data successfully';
      baseService.returnData.data = listKinships;
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
