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
        let personCreateData = await dbService.personService.create() //FALTA PASAR UN ATRIBUTO CON LOS DATOS
        
        responseCode = personCreateData.responseCode;
        responseData = baseController.getSuccessResponse(
            personCreateData.data, 
            personCreateData.message
        );

    } catch (err) {
        responseCode = 500;
        console.error('The person wasn´t registered'); //VERIFICAR EL MENSAJE DE ERROR
        responseData = baseController.getErrorResponse('The person wasn´t registered'); //VERIFICAR EL MENSAJE DE ERROR
    }

    return response
    .status(responseCode)
    .json(responseData);
};

module.exports = {post};