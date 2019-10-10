'use strict';

const devEnvironment = require('./../environment/development.json');
const defaults = require('defaults');
const pg = require('pg');

const setupDatabase = require('./database');

const setupContactTypeModel = require('./contactType');
const setupDocumentTypeModel = require('./documentType');
const setupGenderModel = require('./gender');
const setupKinshipModel = require('./kinship');
const setupCountryModel = require('./country');
const setupPersonModel = require('./person');
const setupUserModel = require('./user');

pg.defaults.ssl = true;

function getEnvironmentConf(environment) {
  const config = require(`./../environment/${environment}.json`);
  return config;
}

module.exports = async function (setup = false) {
  const environment = process.env.NODE_ENV || 'development';
  const config = getEnvironmentConf(environment);

  // If we are in production, get the database password from there
  if (process.env.NODE_ENV === 'production') {
    config.password = process.env.DATABASE_PASS;
  }

  const dbInstance = setupDatabase(config);

  const contactTypeModel = setupContactTypeModel(config);
  const documentTypeModel = setupDocumentTypeModel(config);
  const genderModel = setupGenderModel(config);
  const countryModel = setupCountryModel(config);
  const personModel = setupPersonModel(config);
  const kinshipModel = setupKinshipModel(config);
  const userModel = setupUserModel(config);

  await dbInstance.authenticate();

  if (setup) {
    await dbInstance.sync({ force: true });
  }

  return {
    contactTypeModel,
    documentTypeModel,
    genderModel,
    kinshipModel,
    countryModel,
    personModel,
    userModel
  };
};
