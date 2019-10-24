'use strict';

const express = require('express');
const kinshipsController = require('./kinships.controller');

const router = express.Router();

router.get('/types', kinshipsController.getTypes);
router.post('/', kinshipController.post);
router.put('/:id', kinshipController.update);

module.exports = router;
