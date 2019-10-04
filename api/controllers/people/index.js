'use strict';

const express = require('express');
const peopleController = require('./people.controller');
const personController = require('./person.controller'); 

const router = express.Router();

router.get('/', peopleController.get);
router.post('/', personController.post); 

module.exports = router;
