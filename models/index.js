'use strict';

const defaults = require('defaults');

const setupDatabase = require('./database');

const setupContactTypeModel = require('./contactType');
const setupDocumentTypeModel = require('./documentType');
const setupGenderModel = require('./gender');
const setupKinshipModel = require('./kinship');
const setupCountryModel = require('./country');
const setupPersonModel = require('./person');
const setupUserModel = require('./user');

module.exports = async function(config) {
  config = defaults(config, {
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      iddle: 10000
    }
  });

  const dbInstance = setupDatabase(config);

  const contactTypeModel = setupContactTypeModel(config);
  const documentTypeModel = setupDocumentTypeModel(config);
  const genderModel = setupGenderModel(config);
  const countryModel = setupCountryModel(config);
  const personModel = setupPersonModel(config);
  const kinshipModel = setupKinshipModel(config);
  const userModel = setupUserModel(config);

  await dbInstance.authenticate();

  if (config.setup) {
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
