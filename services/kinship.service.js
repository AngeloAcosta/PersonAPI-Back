'use strict';

const Sequelize = require('sequelize');
const setupBaseService = require('./base.service');
const Op = Sequelize.Op;
const setupPersonService = require('./person.service.js');
const constants = require('./constants');

module.exports = function setupKinshipService(models) {
  const personModel = models.personModel;
  const kinshipModel = models.kinshipModel;
  let baseService = new setupBaseService();
  let personService = new setupPersonService(models);


  async function create(kinshipData) {
    
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
          return baseService.getServiceResponse(200, "Person created", listKinships);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }


   //#region Helpers
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

  async function doListTypes() {
    try {
      const kinshipTypes = getKinshipTypes();
      return baseService.getServiceResponse(200, "Success", kinshipTypes);
    } catch (err) {
      console.log('Error: ', err);
      return baseService.getServiceResponse(500, err, {});
    }
  }

  return {
    doList,
    create,
    doListTypes
  };

}
