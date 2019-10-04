'use strict';

const setupBaseController = require('./../base.controller');
const validations = require('./../../../../person.service');
const setupBDService = require('./../services');

let baseController = new setupBaseController();
const app = express();
app.user(express.json());

const post = async (request, response) => {
    validations.createPersonValidation(Request.body); //Se le pasa la información a validation

    let responseCode;
    let responseData;

    try {
        let dbService = await setupBDService();
        let personData = await dbService.personService.create() //FALTA PASAR UN ATRIBUTO CON LOS DATOS
        

    } catch () {
        
    }


}