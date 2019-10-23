'use strict';

const express = require('express');
const countriesController = require('./countries.controller');

const router = express.Router();

router.get('/', countriesController.get);

module.exports = router;
