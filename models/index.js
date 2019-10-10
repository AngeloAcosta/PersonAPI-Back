'use strict';

const devEnvironment = require('./../environment/development.json');
const defaults = require('defaults');

const setupDatabase = require('./database');

const setupContactTypeModel = require('./contactType');
const setupDocumentTypeModel = require('./documentType');
const setupGenderModel = require('./gender');
const setupKinshipModel = require('./kinship');
const setupCountryModel = require('./country');
const setupPersonModel = require('./person');
const setupUserModel = require('./user');

module.exports = async function (setup = false) {
  const config = {
    database: process.env.DATABASE_NAME || devEnvironment.database,
    username: process.env.DATABASE_USER || devEnvironment.username,
    password: process.env.DATABASE_PASS || devEnvironment.password,
    host: process.env.DATABASE_HOST || devEnvironment.host,
    port: process.env.DATABASE_PORT || devEnvironment.port,
    dialect: process.env.DATABASE_DIALECT || devEnvironment.dialect,
    operatorsAliases: false
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
