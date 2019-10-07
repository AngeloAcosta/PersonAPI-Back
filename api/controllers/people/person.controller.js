'use strict';

const setupBaseController = require('./../base.controller');
const validations = require('./../../../services/person.service');
const setupBDService = require('./../../../services');
const express = require('express');

let baseController = new setupBaseController();
//const app = express();
//app.user(express.json());

const get = async (request, response) => {
  
  let responseCode;
  let responseData;

  try {
    let dbService = await setupDBService();
    let peopleData = await dbService.personService.findById(request.params.id);

    responseCode = peopleData.responseCode;
    
    responseData = baseController.getSuccessResponse(
        peopleData.data, peopleData.message
    );
    
 

  } catch (err) {
    responseCode = 500;
    console.error('Error getting all people: ', err);
    responseData = baseController.getErrorResponse('Error getting all people.');
  }

  return response
    .status(responseCode)
    .json(responseData);
  };

const post = async (request, response) => {
    //validations.createPersonValidation(person); //Se le pasa la información a validation

    let responseCode;
    let responseData;

    try {
        let dbService = await setupBDService();
        let personCreateData = await dbService.personService.create(request) //FALTA PASAR UN ATRIBUTO CON LOS DATOS
        
        responseCode = personCreateData.responseCode;
        responseData = baseController.getSuccessResponse(
            personCreateData.data, 
            personCreateData.message
        );

    } catch (err) {
        responseCode = 500;
        console.error('The person wasn´t registered' + err); //VERIFICAR EL MENSAJE DE ERROR
        responseData = baseController.getErrorResponse('The person wasn´t registered'); //VERIFICAR EL MENSAJE DE ERROR
    }

    return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {
  get,
  post
};
