'use strict';

const express = require('express');
const peopleController = require('./people.controller');
const personController = require('./person.controller');

const router = express.Router();

router.get('/', peopleController.get);
router.post('/', personController.post);
router.get('/:id', personController.get);
router.get('/:id/kinships', personController.getKinships);
router.put('/:id', personController.put);

module.exports = router;
