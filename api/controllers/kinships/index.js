'use strict';

const express = require('express');
const kinshipsController = require('./kinships.controller');

const router = express.Router();

router.get('/', kinshipsController.get);
router.get('/:id', kinshipController.get);
router.post('/', kinshipController.post);
router.get('/types', kinshipsController.getTypes);

module.exports = router;
