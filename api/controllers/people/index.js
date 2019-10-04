'use strict';

const express = require('express');
const peopleController = require('./people.controller');
const personController = require('./person.controller'); //Se guarda la ruta en una const

const router = express.Router();

router.get('/', peopleController.get);
router.post('/', personController.post); //POST

module.exports = router;
