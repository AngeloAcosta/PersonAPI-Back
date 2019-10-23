'use strict';

const express = require('express');
const peopleController = require('./document.types.controller');

const router = express.Router();

router.get('/', peopleController.get);

module.exports = router;
