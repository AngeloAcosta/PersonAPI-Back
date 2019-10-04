'use strict';

const setupBaseController = require('./../base.controller');
const setupBDService = require('./../services');

let baseController = new setupBaseController();

const post = async (request, response) => {
    let responseCode;
    let responseData;

    try {
        let dbService = await setupBDService();
        let personData = await dbService.personService.create()
    } catch () {
        
    }


}