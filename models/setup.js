'use strict';

const debug = require('debug');
const inquirer = require('inquirer');
const chalk = require('chalk');
const dbInstance = require('./');

const prompt = inquirer.createPromptModule();

async function setup () {
    const answer = await prompt([
        {
            type: 'confirm',
            name: 'setup',
            message: 'This will destroy your database, are you sure?'
        }
    ]);

    if (!answer.setup) {
        return console.log('Nothing to be worry about :D');
    }

    const config = {
        database: process.env.DB_NAME || 'person_db',
        username: process.env.DB_USER || 'person_db_user',
        password: process.env.DB_PASS || '',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.PORT || '3306',
        dialect: 'mysql',
        logging: s => debug(s),
        setup: true
    };

    await dbInstance(config).catch(handleFatalError);

    console.log('Success');
    process.exit(0);
}

function handleFatalError(err) {
    console.error(`${chalk.red('[Fatal error]')} ${err.message}`);
    console.error(err.stack);
    process.exit(1);
}

setup();
