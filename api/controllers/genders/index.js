'use strict';

const express = require('express');
const gendersController = require('./genders.controller');

const router = express.Router();

router.get('/', gendersController.get);

module.exports = router;
