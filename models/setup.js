'use strict';

const debug = require('debug');
const inquirer = require('inquirer');
const chalk = require('chalk');
const dbInstance = require('./');
const devEnvironment = require('./../environment/development.json');
const seeders = require('./setup.seeders');

const prompt = inquirer.createPromptModule();

async function setup() {
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    }
  ]);

  if (!answer.setup) {
    return console.log('Nothing to be worry about :D(just jose)');
  }

  const config = {
    database: process.env.DB_NAME || devEnvironment.database,
    username: process.env.DB_USER || devEnvironment.username,
    password: process.env.DB_PASS || devEnvironment.password,
    host: process.env.DB_HOST || devEnvironment.host,
    port: process.env.PORT || devEnvironment.port,
    dialect: 'mysql',
    logging: s => debug(s),
    setup: true
  };

  //const db = await dbInstance(config).catch(handleFatalError);
  const db = await dbInstance(config);
  await seeders.seedContactTypes(db.contactTypeModel);
  await seeders.seedCountries(db.countryModel);
  await seeders.seedDocumentTypes(db.documentTypeModel);
  await seeders.seedGenders(db.genderModel);
  await seeders.seedPeople(db.personModel);

  //console.log('Success');
  //process.exit(0);
}

function handleFatalError(err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

module.exports = setup;
