'use strict';

const express = require('express');
const kinshipController = require('./kinship.controller');
const kinshipsController = require('./kinships.controller');

const router = express.Router();

router.get('/types', kinshipsController.getTypes);
router.post('/:personId/:relativeId', kinshipController.post);
router.post('/:personId/:relativeId/test', kinshipController.postTest);

module.exports = router;
