'use strict';

const setupBaseController = require('./../base.controller');
const validations = require('./../../../../person.service');
const setupBDService = require('./../services');

let baseController = new setupBaseController();
const app = express();
app.user(express.json());

const post = async (request, response) => {
    validations.createPersonValidation(person); //Se le pasa la información a validation

    let responseCode;
    let responseData;

    try {
        let dbService = await setupBDService();
        let personData = await dbService.personService.create() //FALTA PASAR UN ATRIBUTO CON LOS DATOS
        
        responseCode = personData.responseCode;
        responseData = baseController.getSuccessResponse(
            personData.data, personData.message
        );

    } catch (err) {
        responseCode = 500;
        console.error('User was not registered'); //VERIFICAR EL MENSAJE DE ERROR
        responseData = baseController.getErrorResponse('User wa not registered'); //VERIFICAR EL MENSAJE DE ERROR
    }

    return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {post};