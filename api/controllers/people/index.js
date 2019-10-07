'use strict';

const express = require('express');
const peopleController = require('./people.controller');
<<<<<<< HEAD
const personController = require('./person.controller');
=======
const personController =require ('./person.controller');
>>>>>>> develop

const router = express.Router();

router.get('/', peopleController.get);
router.get('/:id',personController.get);


router.put('/:id', personController.put);

module.exports = router;
