'use strict';

const express = require('express');
const kinshipController = require('./kinship.controller');

const router = express.Router();

router.post('/', kinshipController.post);
router.put('/:id', kinshipController.update);

module.exports = router;
