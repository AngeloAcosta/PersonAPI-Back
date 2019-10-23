'use strict';

const express = require('express');
const kinshipController = require('./kinship.controller');
const kinshipsController = require('./kinships.controller');

const router = express.Router();

router.get('/', kinshipsController.get);
router.get('/:id', kinshipController.get);
router.post('/', kinshipController.post);

module.exports = router;
