'use strict';

const defaults = require('defaults');

const setupDatabase = require('./../services/database');
const setupUserModel = require('./user');
const setupPersonModel = require('./person');

module.exports = async function (config) {
    config = defaults(config, {
        dialect: 'mysql',
        pool: {
            max: 10,
            min: 0,
            iddle: 10000
        },
        query: {
            raw: true
        }
    });

    const dbInstance = setupDatabase(config);

    const userModel = setupUserModel(config);
    const personModel = setupPersonModel(config);

    await dbInstance.authenticate();

    if (config.setup) {
        await dbInstance.sync({ force: true });
    }

    return {
        userModel,
        personModel
    };
};