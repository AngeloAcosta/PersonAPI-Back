'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupPersonService(model) {

    let baseService = new setupBaseService();

    async function doList() {
        let people = await model.findAll();

        baseService.returnData.responseCode = 200;
        baseService.returnData.message = 'Getting data successfully';
        baseService.returnData.data = people;

        return baseService.returnData;
    }

    return {
        doList
    };

};
