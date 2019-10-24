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

  /*
  function ordenarArreglo(arreglo,param1,param2){
	if(param){
		if(param = ASC)
			return arreglo.sort((a,b)=>a.param2 - b.param2 >= 1 )
		else 
			return arreglo.sort((a,b)=>a.param2 - b.param2 <= -1 )	
}
}
  */

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
    findById,
    create,
    doListTypes
  };

}
