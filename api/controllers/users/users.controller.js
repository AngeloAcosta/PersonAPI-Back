'use strict';

const setupBaseController = require('./../base.controller');
const setupDBService = require('./../../../services');

let baseController = new setupBaseController();
const dbService = setupDBService();

const get = async (request, response) => {

  const services = await setupDBService();

  const userResponseData = await services.userService.doList();

  return response
    .status(200)
    .json(userResponseData);
};

module.exports = {
  get
};
