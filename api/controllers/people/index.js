'use strict';

const express = require('express');
const peopleController = require('./people.controller');
const personController = require('./person.controller');

const router = express.Router();

router.get('/', peopleController.get);
router.post('/', personController.post);
router.get('/:id', personController.get);
router.put('/:id', personController.put);
router.get('/:id/kinships', personController.getKinships);
router.post('/:id/kinships', personController.postKinships);
router.post('/:id/kinships/test', personController.postKinshipsTest);

module.exports = router;
