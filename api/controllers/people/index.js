'use strict';

const express = require('express');
const peopleController = require('./people.controller');

const router = express.Router();

router.get('/', peopleController.get);

module.exports = router;
