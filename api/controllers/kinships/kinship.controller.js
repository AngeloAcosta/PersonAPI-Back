'use strict';
const setupBaseController = require('../base.controller');
const setupDBService=require('../../../services');

let baseController= new setupBaseController();
const dbService = setupDBService();

const get = async (request, response) => {

  let responseCode;
  let responseData;

  try {
    
    let dbService = await setupDBService();
    console.log(request.params.id);
    
    let kinshipsData = await dbService.kinshipService.findById(request.params.id);
     responseCode = kinshipsData.responseCode;
    
    responseData = baseController.getSuccessResponse(
        kinshipsData.data, kinshipsData.message
      
    );
    
  } catch (err) {
    responseCode = 500;
    console.error('Error getting all kinship: ', err);
    responseData = baseController.getErrorResponse('Error getting all kindships.');
  }

  return response
    .status(responseCode)
    .json(responseData);
  

};

const post = async (request,response) => {
  
      let responseCode = 500;
      let responseData;
    
      try {
        const kinshipData={
          ...request.body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        console.log(kinshipData);
        let dbService = await setupDBService();
        const newKinshipData = await dbService.kinshipService.create(kinshipData);
    
        responseCode = newKinshipData.responseCode;
        responseData = baseController.getSuccessResponse(
          newKinshipData.data,
          newKinshipData.message
        );
      } catch (err) {
        console.error('Error creating a new kinship: ', err);
        responseData = baseController.getErrorResponse('Error creating a new kinship');
      }
    
      return response
        .status(responseCode)
        .json(responseData);

};
/*
const update = async (request, response) => {
  if (!request.params.id) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('Parameter is missing'));
  }

  const kindshipId = request.params.id;
  let kindshipData = {};

  if (request.body.name) {
    kindshipData.name = request.body.name;
  }

  if (request.body.lastName) {
    kindshipData.lastName = request.body.lastName;
  }


  let responseCode;
  let responseData;

  try {
    const updatedData = await dbService
      .userService
      .update(userId, userData);

    responseCode = updatedData.responseCode;
    responseData = baseController.getSuccessResponse(
      updatedData.data,
      updatedData.message
    );
  } catch (err) {
    responseCode = 500;
    console.error('Error updating user information: ', err);
    responseData = baseController.getErrorResponse('Error updating user information');
  }

  return response
    .status(responseCode)
    .json(responseData);
};
*/

module.exports={
  get,
    post
};