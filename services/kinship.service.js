'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const Op = Sequelize.Op;
const setupPersonService = require('./person.service.js');

module.exports = function setupKinshipService(models) {
  const personModel = models.personModel;
  const kinshipModel = models.kinshipModel;
  const validationService = models.validationService;
  let baseService = new setupBaseService();
  let personService = new setupPersonService(models);

  async function create(kinshipData) {
    
  }

  function getOrderField(orderBy){
    let qOrderBy = ['name'];
    if(orderBy === 2){
      qOrderBy = ['kinships','kinshipType'];
    } else if (orderBy === 3){
      qOrderBy = ['name'];
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
  
  async function doList() {
   let listKinships =[]
    try {
      const personid = await personModel.findAll({
        include: [
          {
            as: 'person',
            model: personModel
          },
          {
            as: 'relative',
            model: personModel
          }
        ]
       });
           for (let i = 0; i<personid.length;i++) {
            let kinship = await personService.getPersonKinships(personid[i]);
            
            listKinships.push(kinship);
            
          }
           
        // Mold the response
      //const levelTwo = getDoListModel(levelTwo);

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
