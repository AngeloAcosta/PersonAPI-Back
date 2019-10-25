'use strict';

const Sequelize = require('sequelize');
const setupBaseController = require('./../base.controller');
const setupServices = require('./../../../services');

const Op = Sequelize.Op;
const baseController = new setupBaseController();

const get = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get the query
    const query = request.query.query || '';
    // Find all people that satisfy the query
    const whereClause = { [Op.like]: `%${query}%` };
    const people = await services.personService.personModel.findAll({
      where: { [Op.or]: [{ name: whereClause }, { lastName: whereClause }], isGhost: false }
    });
    // Find and concatenate the kinships of each person
    let kinships = [];
    for (let index = 0; index < people.length; index++) {
      const person = people[index];
      const personKinships = await services.sharedService.getPersonKinships(person);
      kinships = kinships.concat(personKinships);
    }
    // Return the data
    responseCode = 200;
    responseData = baseController.getSuccessResponse(kinships, 'Success');
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

const getTypes = async (request, response) => {
  let responseCode;
  let responseData;
  try {
    const services = await setupServices();
    // Get the kinship types
    const kinshipsData = await services.kinshipService.doListTypes();
    // Return the data
    responseCode = kinshipsData.responseCode;
    responseData = baseController.getSuccessResponse(kinshipsData.data, kinshipsData.message);
  } catch (err) {
    console.error('Error: ', err);
    responseCode = 500;
    responseData = baseController.getErrorResponse('Error');
  }
  return response.status(responseCode).json(responseData);
};

module.exports = {
  get,
  getTypes
};
