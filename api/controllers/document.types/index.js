'use strict';

const express = require('express');
const documentTypesController = require('./document.types.controller');

const router = express.Router();

router.get('/', documentTypesController.get);

module.exports = router;
