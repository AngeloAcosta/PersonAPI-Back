'use strict';

const express = require('express');
const kinshipController = require('./kinship.controller');

const router = express.Router();

router.post('/', kinshipController.post);

module.exports = router;
