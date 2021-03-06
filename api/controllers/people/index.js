'use strict';

const express = require('express');
const peopleController = require('./people.controller');
const personController = require('./person.controller');

const router = express.Router();

router.get('/', peopleController.get);
router.post('/', personController.post);
router.get('/:id', personController.get);
router.put('/:id', personController.put);
router.delete('/:id', personController.doDelete);
router.get('/:id/kinships', personController.getKinships);
router.get('/:id/kinships/tree', personController.getKinshipsTree);
router.post('/:id/kinships', personController.postKinships);
router.put('/:personId/kinships/:relativeId', personController.putKinships);
router.post('/:id/kinships/test', personController.postKinshipsTest);
router.put('/:personId/kinships/:relativeId/test', personController.putKinshipsTest);
router.post('/:id/restore', personController.postRestore);
router.delete('/:personId/kinships/:relativeId', personController.deleteKinships);

module.exports = router;
